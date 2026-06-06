const db = require('../lib/db');

exports.generatePO = async (req, res) => {
  const { quotation_id } = req.body;
  const created_by = req.user.id;
  try {
    const q = await db.query(`
      SELECT SUM(qi.unit_price * ri.quantity) as total_amount
      FROM quotation_items qi
      JOIN rfq_items ri ON qi.rfq_item_id = ri.id
      WHERE qi.quotation_id = $1
    `, [quotation_id]);

    const total_amount = q.rows[0].total_amount;
    const po_number = 'PO-' + Date.now();

    const po = await db.query(
      'INSERT INTO purchase_orders (po_number, quotation_id, total_amount, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [po_number, quotation_id, total_amount, created_by]
    );

    res.status(201).json(po.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.generateInvoice = async (req, res) => {
  const { purchase_order_id, tax_amount } = req.body;
  try {
    const po = await db.query('SELECT total_amount FROM purchase_orders WHERE id = $1', [purchase_order_id]);
    if (po.rows.length === 0) return res.status(404).json({ message: 'PO not found' });

    const total_amount = parseFloat(po.rows[0].total_amount) + parseFloat(tax_amount);
    const invoice_number = 'INV-' + Date.now();

    const invoice = await db.query(
      'INSERT INTO invoices (invoice_number, purchase_order_id, total_amount, tax_amount) VALUES ($1, $2, $3, $4) RETURNING *',
      [invoice_number, purchase_order_id, total_amount, tax_amount]
    );

    res.status(201).json(invoice.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getPOs = async (req, res) => {
  try {
    const pos = await db.query('SELECT * FROM purchase_orders ORDER BY created_at DESC');
    res.json(pos.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
