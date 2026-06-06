const db = require('../lib/db');

exports.submitQuotation = async (req, res) => {
  const { rfq_id, vendor_id, delivery_timeline, notes, items } = req.body;
  try {
    await db.query('BEGIN');

    const newQuotation = await db.query(
      'INSERT INTO quotations (rfq_id, vendor_id, delivery_timeline, notes) VALUES ($1, $2, $3, $4) RETURNING *',
      [rfq_id, vendor_id, delivery_timeline, notes]
    );
    const quotation_id = newQuotation.rows[0].id;

    for (let item of items) {
      await db.query(
        'INSERT INTO quotation_items (quotation_id, rfq_item_id, unit_price) VALUES ($1, $2, $3)',
        [quotation_id, item.rfq_item_id, item.unit_price]
      );
    }

    await db.query('COMMIT');
    res.status(201).json(newQuotation.rows[0]);
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getQuotationsByRFQ = async (req, res) => {
  try {
    const quotations = await db.query(`
      SELECT q.*, v.company_name, 
      (SELECT SUM(qi.total_price * ri.quantity) FROM quotation_items qi JOIN rfq_items ri ON qi.rfq_item_id = ri.id WHERE qi.quotation_id = q.id) as total_amount
      FROM quotations q
      JOIN vendors v ON q.vendor_id = v.id
      WHERE q.rfq_id = $1
    `, [req.params.rfq_id]);
    res.json(quotations.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getQuotationById = async (req, res) => {
  try {
    const quotation = await db.query('SELECT * FROM quotations WHERE id = $1', [req.params.id]);
    if (quotation.rows.length === 0) return res.status(404).json({ message: 'Quotation not found' });

    const items = await db.query(`
      SELECT qi.*, ri.product_name, ri.quantity, (qi.unit_price * ri.quantity) as calculated_total
      FROM quotation_items qi
      JOIN rfq_items ri ON qi.rfq_item_id = ri.id
      WHERE qi.quotation_id = $1
    `, [req.params.id]);

    res.json({ ...quotation.rows[0], items: items.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
