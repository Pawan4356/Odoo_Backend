const db = require("../lib/db");
const { handleDbError } = require("../lib/db-errors");

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
