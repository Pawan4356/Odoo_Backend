const db = require("../lib/db");
const { handleDbError } = require("../lib/db-errors");

exports.getReports = async (req, res) => {
  try {
    const [summary, categorySpend, topVendors, monthly] = await Promise.all([
      db.query(
        `SELECT
          COALESCE((SELECT SUM(total_amount) FROM purchase_orders), 0) AS total_spend,
          (SELECT COUNT(*) FROM vendors WHERE status = 'Active') AS active_vendors,
          (SELECT COUNT(*) FROM purchase_orders) AS total_pos,
          (SELECT COUNT(*) FROM purchase_orders WHERE status = 'Fulfilled') AS fulfilled_pos,
          (SELECT COUNT(*) FROM quotations WHERE status = 'Pending') AS pending_approvals`,
      ),
      db.query(
        `SELECT COALESCE(v.category, 'General') AS label,
          COALESCE(SUM(po.total_amount), 0) AS value
         FROM purchase_orders po
         JOIN quotations q ON q.id = po.quotation_id
         JOIN vendors v ON v.id = q.vendor_id
         GROUP BY COALESCE(v.category, 'General')
         ORDER BY value DESC`,
      ),
      db.query(
        `SELECT v.company_name AS name,
          COALESCE(SUM(po.total_amount), 0) AS spend,
          COUNT(po.id) AS pos
         FROM purchase_orders po
         JOIN quotations q ON q.id = po.quotation_id
         JOIN vendors v ON v.id = q.vendor_id
         GROUP BY v.id, v.company_name
         ORDER BY spend DESC
         LIMIT 5`,
      ),
      db.query(
        `SELECT to_char(date_trunc('month', created_at), 'Mon') AS m,
          COALESCE(SUM(total_amount), 0) AS v
         FROM purchase_orders
         WHERE created_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '5 months'
         GROUP BY date_trunc('month', created_at)
         ORDER BY date_trunc('month', created_at)`,
      ),
    ]);

    const s = summary.rows[0];
    const totalPOs = Number(s.total_pos);
    const fulfilledPOs = Number(s.fulfilled_pos);

    res.json({
      summary: {
        totalSpend: Number(s.total_spend),
        activeVendors: Number(s.active_vendors),
        poFulfilledPct: totalPOs ? Math.round((fulfilledPOs / totalPOs) * 100) : 0,
        pendingIssues: Number(s.pending_approvals),
      },
      categorySpend: categorySpend.rows.map((row) => ({
        label: row.label,
        value: Number(row.value),
      })),
      topVendors: topVendors.rows.map((row) => ({
        name: row.name,
        spend: Number(row.spend),
        pos: Number(row.pos),
      })),
      monthly: monthly.rows.map((row) => ({
        m: row.m,
        v: Number(row.v),
      })),
    });
  } catch (err) {
    handleDbError(err, res);
  }
};
