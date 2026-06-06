const db = require("../lib/db");
const { handleDbError } = require("../lib/db-errors");

const categoryFor = (targetType) => {
  if (targetType === "RFQ") return "RFQ";
  if (targetType === "APPROVAL") return "Approval";
  if (targetType === "PO" || targetType === "INVOICE") return "Invoice";
  return "Vendor";
};

exports.getActivity = async (req, res) => {
  try {
    const params = [];
    let vendorFilter = "";
    if (req.user.role === "Vendor") {
      params.push(req.user.id);
      vendorFilter = `WHERE EXISTS (
        SELECT 1
        FROM vendors v
        WHERE v.user_id = $1
          AND (
            (l.target_type = 'VENDOR' AND l.target_id = v.id)
            OR (l.target_type = 'RFQ' AND EXISTS (
              SELECT 1 FROM rfq_vendors rv
              WHERE rv.rfq_id = l.target_id AND rv.vendor_id = v.id
            ))
            OR (l.target_type IN ('PO', 'INVOICE') AND EXISTS (
              SELECT 1
              FROM purchase_orders po
              JOIN quotations q ON q.id = po.quotation_id
              WHERE po.id = l.target_id AND q.vendor_id = v.id
            ))
          )
      )`;
    }

    const logs = await db.query(
      `SELECT l.*, u.name AS actor_name, u.role AS actor_role
       FROM activity_logs l
       LEFT JOIN users u ON u.id = l.user_id
       ${vendorFilter}
       ORDER BY l.created_at DESC
       LIMIT 100`,
      params,
    );

    res.json(
      logs.rows.map((row) => ({
        id: row.id,
        category: categoryFor(row.target_type),
        title: row.action,
        description: `${row.actor_name || "System"} · ${row.target_type || "Record"} ${row.target_id || ""}`.trim(),
        at: row.created_at,
        actorRole: row.actor_role,
        targetType: row.target_type,
        targetId: row.target_id,
      })),
    );
  } catch (err) {
    handleDbError(err, res);
  }
};
