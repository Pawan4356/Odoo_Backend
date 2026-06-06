const db = require("../lib/db");
const { handleDbError } = require("../lib/db-errors");

exports.getApprovals = async (req, res) => {
  try {
    const approvals = await db.query(
      `SELECT q.id AS quotation_id,
        q.status AS quotation_status,
        q.delivery_timeline,
        q.notes,
        q.created_at AS quotation_created_at,
        r.id AS rfq_id,
        r.title AS rfq_title,
        v.id AS vendor_id,
        v.company_name AS vendor_name,
        a.id AS approval_id,
        a.status AS approval_status,
        a.remarks,
        a.created_at AS approval_created_at,
        manager.name AS manager_name,
        COALESCE(total.total_amount, 0) AS total_amount
       FROM quotations q
       JOIN rfqs r ON r.id = q.rfq_id
       JOIN vendors v ON v.id = q.vendor_id
       LEFT JOIN approvals a ON a.target_type = 'QUOTATION' AND a.target_id = q.id
       LEFT JOIN users manager ON manager.id = a.manager_id
       LEFT JOIN LATERAL (
         SELECT SUM(qi.unit_price * ri.quantity) AS total_amount
         FROM quotation_items qi
         JOIN rfq_items ri ON ri.id = qi.rfq_item_id
         WHERE qi.quotation_id = q.id
       ) total ON true
       ORDER BY COALESCE(a.created_at, q.created_at) DESC`,
    );
    res.json(approvals.rows);
  } catch (err) {
    handleDbError(err, res);
  }
};

exports.approveQuotation = async (req, res) => {
  const { status, remarks } = req.body;
  const manager_id = req.user.id;
  const target_id = req.params.id;

  try {
    const quotation = await db.query(
      "SELECT id, status, rfq_id FROM quotations WHERE id = $1",
      [target_id],
    );
    if (quotation.rows.length === 0) {
      return res.status(404).json({ message: "Quotation not found" });
    }
    if (quotation.rows[0].status !== "Pending") {
      return res
        .status(400)
        .json({
          message: "Only pending quotations can be approved or rejected",
        });
    }

    const rfq = await db.query("SELECT status FROM rfqs WHERE id = $1", [
      quotation.rows[0].rfq_id,
    ]);
    if (rfq.rows.length === 0) {
      return res.status(400).json({ message: "Associated RFQ not found" });
    }
    if (status === "Approved" && rfq.rows[0].status !== "Open") {
      return res
        .status(400)
        .json({ message: "Cannot approve quotation for a non-open RFQ" });
    }

    const existingApproval = await db.query(
      "SELECT id FROM approvals WHERE target_type = 'QUOTATION' AND target_id = $1 AND status IN ('Approved', 'Rejected')",
      [target_id],
    );
    if (existingApproval.rows.length > 0) {
      return res
        .status(409)
        .json({ message: "This quotation has already been reviewed" });
    }

    await db.query("BEGIN");

    const approval = await db.query(
      "INSERT INTO approvals (target_type, target_id, manager_id, status, remarks) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      ["QUOTATION", target_id, manager_id, status, remarks],
    );

    await db.query(
      "INSERT INTO activity_logs (user_id, action, target_type, target_id) VALUES ($1, $2, $3, $4)",
      [
        manager_id,
        `Quotation ${target_id} ${status.toLowerCase()}`,
        "APPROVAL",
        approval.rows[0].id,
      ],
    );

    if (status === "Approved") {
      await db.query("UPDATE quotations SET status = $1 WHERE id = $2", [
        "Approved",
        target_id,
      ]);
      await db.query("UPDATE rfqs SET status = $1 WHERE id = $2", [
        "Completed",
        quotation.rows[0].rfq_id,
      ]);
      await db.query(
        "UPDATE quotations SET status = $1 WHERE rfq_id = $2 AND id != $3 AND status = $4",
        ["Rejected", quotation.rows[0].rfq_id, target_id, "Pending"],
      );

      // Automatically generate Purchase Order
      const qAmount = await db.query(
        `SELECT SUM(qi.unit_price * ri.quantity) as total_amount
         FROM quotation_items qi
         JOIN rfq_items ri ON qi.rfq_item_id = ri.id
         WHERE qi.quotation_id = $1`,
        [target_id],
      );
      const total_amount = qAmount.rows[0]?.total_amount || 0;
      if (total_amount > 0) {
        const po_number = "PO-" + Date.now();
        const po = await db.query(
          "INSERT INTO purchase_orders (po_number, quotation_id, total_amount, created_by) VALUES ($1, $2, $3, $4) RETURNING id",
          [po_number, target_id, total_amount, manager_id],
        );

        // Automatically generate Invoice (assuming 18% tax as default)
        const tax_amount = total_amount * 0.18;
        const invoice_total = parseFloat(total_amount) + tax_amount;
        const invoice_number = "INV-" + Date.now();
        await db.query(
          "INSERT INTO invoices (invoice_number, purchase_order_id, total_amount, tax_amount) VALUES ($1, $2, $3, $4)",
          [invoice_number, po.rows[0].id, invoice_total, tax_amount],
        );

        await db.query(
          "INSERT INTO activity_logs (user_id, action, target_type, target_id) VALUES ($1, $2, $3, $4)",
          [manager_id, `Purchase order ${po_number} generated via Approval`, "PO", po.rows[0].id],
        );
      }
    } else if (status === "Rejected") {
      await db.query("UPDATE quotations SET status = $1 WHERE id = $2", [
        "Rejected",
        target_id,
      ]);
    }

    await db.query("COMMIT");
    res.status(201).json(approval.rows[0]);
  } catch (err) {
    await db.query("ROLLBACK");
    handleDbError(err, res);
  }
};
