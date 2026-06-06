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

    await db.query("COMMIT");
    res.status(201).json(newRFQ.rows[0]);
  } catch (err) {
    await db.query("ROLLBACK");
    handleDbError(err, res);
  }
};

exports.getRFQs = async (req, res) => {
  try {
    const rfqs = await db.query("SELECT * FROM rfqs ORDER BY created_at DESC");
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
      `SELECT v.* FROM vendors v
       JOIN rfq_vendors rv ON v.id = rv.vendor_id
       WHERE rv.rfq_id = $1`,
      [req.params.id],
    );

    res.json({ ...rfq.rows[0], items: items.rows, vendors: vendors.rows });
  } catch (err) {
    handleDbError(err, res);
  }
};
