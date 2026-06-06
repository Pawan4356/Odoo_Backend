const db = require("../lib/db");
const { handleDbError } = require("../lib/db-errors");

async function validateVendorIds(vendor_ids) {
  if (!vendor_ids || vendor_ids.length === 0) return null;

  const uniqueIds = [...new Set(vendor_ids)];
  const result = await db.query(
    "SELECT id FROM vendors WHERE id = ANY($1::int[])",
    [uniqueIds],
  );
  if (result.rows.length !== uniqueIds.length) {
    return "One or more vendor IDs do not exist";
  }
  return null;
}

exports.createRFQ = async (req, res) => {
  const { title, description, deadline, items, vendor_ids } = req.body;
  const created_by = req.user.id;

  try {
    const vendorError = await validateVendorIds(vendor_ids);
    if (vendorError) {
      return res.status(400).json({ message: vendorError });
    }

    await db.query("BEGIN");

    const newRFQ = await db.query(
      "INSERT INTO rfqs (title, description, deadline, created_by) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, description, deadline, created_by],
    );
    const rfq_id = newRFQ.rows[0].id;

    for (const item of items) {
      await db.query(
        "INSERT INTO rfq_items (rfq_id, product_name, quantity, description) VALUES ($1, $2, $3, $4)",
        [rfq_id, item.product_name, item.quantity, item.description],
      );
    }

    if (vendor_ids && vendor_ids.length > 0) {
      for (const v_id of vendor_ids) {
        await db.query(
          "INSERT INTO rfq_vendors (rfq_id, vendor_id) VALUES ($1, $2)",
          [rfq_id, v_id],
        );
      }
    }

    await db.query(
      "INSERT INTO activity_logs (user_id, action, target_type, target_id) VALUES ($1, $2, $3, $4)",
      [created_by, `RFQ ${title} created`, "RFQ", rfq_id],
    );

    await db.query("COMMIT");
    res.status(201).json(newRFQ.rows[0]);
  } catch (err) {
    await db.query("ROLLBACK");
    handleDbError(err, res);
  }
};

exports.getRFQs = async (req, res) => {
  try {
    const params = [];
    let where = "";
    if (req.user.role === "Vendor") {
      params.push(req.user.id);
      where = `WHERE EXISTS (
        SELECT 1
        FROM rfq_vendors rv
        JOIN vendors vv ON vv.id = rv.vendor_id
        WHERE rv.rfq_id = r.id AND vv.user_id = $1
      )`;
    }

    const rfqs = await db.query(
      `SELECT r.*,
        COALESCE(items.items, '[]'::json) AS items,
        COALESCE(vendors.vendors, '[]'::json) AS vendors
       FROM rfqs r
       LEFT JOIN LATERAL (
         SELECT json_agg(
           json_build_object(
             'id', ri.id,
             'product_name', ri.product_name,
             'quantity', ri.quantity,
             'description', ri.description
           )
           ORDER BY ri.id
         ) AS items
         FROM rfq_items ri
         WHERE ri.rfq_id = r.id
       ) items ON true
       LEFT JOIN LATERAL (
         SELECT json_agg(
           json_build_object(
             'id', v.id,
             'user_id', v.user_id,
             'company_name', v.company_name,
             'contact_person', v.contact_person,
             'phone', v.phone,
             'gst_details', v.gst_details,
             'category', v.category,
             'status', v.status,
             'email', u.email
           )
           ORDER BY v.company_name
         ) AS vendors
         FROM rfq_vendors rv
         JOIN vendors v ON v.id = rv.vendor_id
         JOIN users u ON u.id = v.user_id
         WHERE rv.rfq_id = r.id
       ) vendors ON true
       ${where}
       ORDER BY r.created_at DESC`,
      params,
    );
    res.json(rfqs.rows);
  } catch (err) {
    handleDbError(err, res);
  }
};

exports.getRFQById = async (req, res) => {
  try {
    const rfq = await db.query("SELECT * FROM rfqs WHERE id = $1", [
      req.params.id,
    ]);
    if (rfq.rows.length === 0) {
      return res.status(404).json({ message: "RFQ not found" });
    }

    const items = await db.query("SELECT * FROM rfq_items WHERE rfq_id = $1", [
      req.params.id,
    ]);
    const vendors = await db.query(
      `SELECT v.*, u.email FROM vendors v
       JOIN rfq_vendors rv ON v.id = rv.vendor_id
       JOIN users u ON u.id = v.user_id
       WHERE rv.rfq_id = $1`,
      [req.params.id],
    );

    res.json({ ...rfq.rows[0], items: items.rows, vendors: vendors.rows });
  } catch (err) {
    handleDbError(err, res);
  }
};
