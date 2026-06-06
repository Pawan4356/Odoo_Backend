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

    res.status(201).json(invoice.rows[0]);
  } catch (err) {
    handleDbError(err, res);
  }
};

exports.getPOs = async (req, res) => {
  try {
    const pos = await db.query(
      "SELECT * FROM purchase_orders ORDER BY created_at DESC",
    );
    res.json(pos.rows);
  } catch (err) {
    handleDbError(err, res);
  }
};
