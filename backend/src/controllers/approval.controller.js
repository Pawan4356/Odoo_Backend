const db = require('../lib/db');

exports.approveQuotation = async (req, res) => {
  const { status, remarks } = req.body;
  const manager_id = req.user.id;
  const target_id = req.params.id;
  try {
    await db.query('BEGIN');

    const approval = await db.query(
      'INSERT INTO approvals (target_type, target_id, manager_id, status, remarks) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      ['QUOTATION', target_id, manager_id, status, remarks]
    );

    if (status === 'Approved') {
      await db.query('UPDATE quotations SET status = $1 WHERE id = $2', ['Approved', target_id]);
      
      // Get the RFQ ID to update its status
      const q = await db.query('SELECT rfq_id FROM quotations WHERE id = $1', [target_id]);
      if(q.rows.length > 0) {
        await db.query('UPDATE rfqs SET status = $1 WHERE id = $2', ['Completed', q.rows[0].rfq_id]);
        
        // Reject other pending quotations
        await db.query('UPDATE quotations SET status = $1 WHERE rfq_id = $2 AND id != $3 AND status = $4', ['Rejected', q.rows[0].rfq_id, target_id, 'Pending']);
      }
    } else if (status === 'Rejected') {
      await db.query('UPDATE quotations SET status = $1 WHERE id = $2', ['Rejected', target_id]);
    }

    await db.query('COMMIT');
    res.status(201).json(approval.rows[0]);
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
