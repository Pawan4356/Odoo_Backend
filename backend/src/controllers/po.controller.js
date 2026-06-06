const db = require("../lib/db");
const { handleDbError } = require("../lib/db-errors");

exports.generatePO = async (req, res) => {
  const { quotation_id } = req.body;
  const created_by = req.user.id;

  try {
    const quotation = await db.query(
      "SELECT id, status FROM quotations WHERE id = $1",
      [quotation_id],
    );
    if (quotation.rows.length === 0) {
      return res.status(404).json({ message: "Quotation not found" });
    }
    if (quotation.rows[0].status !== "Approved") {
      return res
        .status(400)
        .json({
          message:
            "Purchase orders can only be generated from approved quotations",
        });
    }

    const existingPO = await db.query(
      "SELECT id FROM purchase_orders WHERE quotation_id = $1",
      [quotation_id],
    );
    if (existingPO.rows.length > 0) {
      return res
        .status(409)
        .json({
          message: "A purchase order already exists for this quotation",
        });
    }

    const q = await db.query(
      `SELECT SUM(qi.unit_price * ri.quantity) as total_amount
       FROM quotation_items qi
       JOIN rfq_items ri ON qi.rfq_item_id = ri.id
       WHERE qi.quotation_id = $1`,
      [quotation_id],
    );

    const total_amount = q.rows[0].total_amount;
    if (total_amount == null || parseFloat(total_amount) <= 0) {
      return res
        .status(400)
        .json({
          message:
            "Quotation has no valid line items to generate a purchase order",
        });
    }

    const po_number = "PO-" + Date.now();

    const po = await db.query(
      "INSERT INTO purchase_orders (po_number, quotation_id, total_amount, created_by) VALUES ($1, $2, $3, $4) RETURNING *",
      [po_number, quotation_id, total_amount, created_by],
    );

    await db.query(
      "INSERT INTO activity_logs (user_id, action, target_type, target_id) VALUES ($1, $2, $3, $4)",
      [created_by, `Purchase order ${po_number} generated`, "PO", po.rows[0].id],
    );

    res.status(201).json(po.rows[0]);
  } catch (err) {
    handleDbError(err, res);
  }
};

exports.generateInvoice = async (req, res) => {
  const { purchase_order_id, tax_amount } = req.body;

  try {
    const po = await db.query(
      "SELECT id, total_amount FROM purchase_orders WHERE id = $1",
      [purchase_order_id],
    );
    if (po.rows.length === 0) {
      return res.status(404).json({ message: "Purchase order not found" });
    }

    const existingInvoice = await db.query(
      "SELECT id FROM invoices WHERE purchase_order_id = $1",
      [purchase_order_id],
    );
    if (existingInvoice.rows.length > 0) {
      return res
        .status(409)
        .json({ message: "An invoice already exists for this purchase order" });
    }

    const total_amount =
      parseFloat(po.rows[0].total_amount) + parseFloat(tax_amount);
    const invoice_number = "INV-" + Date.now();

    const invoice = await db.query(
      "INSERT INTO invoices (invoice_number, purchase_order_id, total_amount, tax_amount) VALUES ($1, $2, $3, $4) RETURNING *",
      [invoice_number, purchase_order_id, total_amount, tax_amount],
    );

    await db.query(
      "INSERT INTO activity_logs (user_id, action, target_type, target_id) VALUES ($1, $2, $3, $4)",
      [req.user.id, `Invoice ${invoice_number} generated`, "INVOICE", invoice.rows[0].id],
    );

    res.status(201).json(invoice.rows[0]);
  } catch (err) {
    handleDbError(err, res);
  }
};

exports.getPOs = async (req, res) => {
  try {
    const params = [];
    let where = "";
    if (req.user.role === "Vendor") {
      params.push(req.user.id);
      where = "WHERE v.user_id = $1";
    }

    const pos = await db.query(
      `SELECT po.*,
        q.rfq_id,
        q.vendor_id,
        q.delivery_timeline,
        q.notes,
        r.title AS rfq_title,
        v.company_name AS vendor_name,
        v.contact_person,
        v.phone AS vendor_phone,
        v.gst_details,
        v.category AS vendor_category,
        vu.email AS vendor_email,
        buyer.name AS buyer_name,
        buyer.email AS buyer_email,
        COALESCE(items.items, '[]'::json) AS items
       FROM purchase_orders po
       JOIN quotations q ON q.id = po.quotation_id
       JOIN rfqs r ON r.id = q.rfq_id
       JOIN vendors v ON v.id = q.vendor_id
       JOIN users vu ON vu.id = v.user_id
       LEFT JOIN users buyer ON buyer.id = po.created_by
       LEFT JOIN LATERAL (
         SELECT json_agg(
           json_build_object(
             'name', ri.product_name,
             'quantity', ri.quantity,
             'unit_price', qi.unit_price,
             'delivery_days', COALESCE(NULLIF(regexp_replace(q.delivery_timeline, '\\D', '', 'g'), '')::int, 0)
           )
           ORDER BY ri.id
         ) AS items
         FROM quotation_items qi
         JOIN rfq_items ri ON ri.id = qi.rfq_item_id
         WHERE qi.quotation_id = q.id
       ) items ON true
       ${where}
       ORDER BY po.created_at DESC`,
      params,
    );
    res.json(pos.rows);
  } catch (err) {
    handleDbError(err, res);
  }
};
