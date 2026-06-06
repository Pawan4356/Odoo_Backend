const db = require("../lib/db");
const { handleDbError } = require("../lib/db-errors");

async function validateQuotationSubmission({ rfq_id, vendor_id, items, user }) {
  const rfq = await db.query("SELECT id, status FROM rfqs WHERE id = $1", [
    rfq_id,
  ]);
  if (rfq.rows.length === 0) {
    return { status: 404, message: "RFQ not found" };
  }
  if (rfq.rows[0].status !== "Open") {
    return {
      status: 400,
      message: "Quotations can only be submitted for open RFQs",
    };
  }

  const vendor = await db.query(
    "SELECT id, user_id FROM vendors WHERE id = $1",
    [vendor_id],
  );
  if (vendor.rows.length === 0) {
    return { status: 404, message: "Vendor not found" };
  }

  if (user.role === "Vendor" && vendor.rows[0].user_id !== user.id) {
    return {
      status: 403,
      message: "You can only submit quotations for your own vendor profile",
    };
  }

  const invited = await db.query(
    "SELECT 1 FROM rfq_vendors WHERE rfq_id = $1 AND vendor_id = $2",
    [rfq_id, vendor_id],
  );
  if (invited.rows.length === 0) {
    return { status: 400, message: "Vendor is not invited to this RFQ" };
  }

  const existing = await db.query(
    "SELECT id FROM quotations WHERE rfq_id = $1 AND vendor_id = $2",
    [rfq_id, vendor_id],
  );
  if (existing.rows.length > 0) {
    return {
      status: 409,
      message: "A quotation already exists for this RFQ and vendor",
    };
  }

  const rfqItems = await db.query(
    "SELECT id FROM rfq_items WHERE rfq_id = $1",
    [rfq_id],
  );
  const validItemIds = new Set(rfqItems.rows.map((r) => r.id));

  if (items.length !== rfqItems.rows.length) {
    return {
      status: 400,
      message: "Quotation must include pricing for all RFQ items",
    };
  }

  for (const item of items) {
    if (!validItemIds.has(item.rfq_item_id)) {
      return {
        status: 400,
        message: `rfq_item_id ${item.rfq_item_id} does not belong to this RFQ`,
      };
    }
  }

  const submittedIds = items.map((i) => i.rfq_item_id);
  if (new Set(submittedIds).size !== submittedIds.length) {
    return {
      status: 400,
      message: "Duplicate rfq_item_id values in quotation items",
    };
  }

  return null;
}

exports.submitQuotation = async (req, res) => {
  const { rfq_id, vendor_id, delivery_timeline, notes, items } = req.body;

  try {
    const validationError = await validateQuotationSubmission({
      rfq_id,
      vendor_id,
      items,
      user: req.user,
    });
    if (validationError) {
      return res
        .status(validationError.status)
        .json({ message: validationError.message });
    }

    await db.query("BEGIN");

    const newQuotation = await db.query(
      "INSERT INTO quotations (rfq_id, vendor_id, delivery_timeline, notes) VALUES ($1, $2, $3, $4) RETURNING *",
      [rfq_id, vendor_id, delivery_timeline, notes],
    );
    const quotation_id = newQuotation.rows[0].id;

    for (const item of items) {
      await db.query(
        "INSERT INTO quotation_items (quotation_id, rfq_item_id, unit_price) VALUES ($1, $2, $3)",
        [quotation_id, item.rfq_item_id, item.unit_price],
      );
    }

    await db.query("COMMIT");
    res.status(201).json(newQuotation.rows[0]);
  } catch (err) {
    await db.query("ROLLBACK");
    handleDbError(err, res);
  }
};

exports.getQuotationsByRFQ = async (req, res) => {
  try {
    const rfq = await db.query("SELECT id FROM rfqs WHERE id = $1", [
      req.params.rfq_id,
    ]);
    if (rfq.rows.length === 0) {
      return res.status(404).json({ message: "RFQ not found" });
    }

    const quotations = await db.query(
      `SELECT q.*, v.company_name,
       (SELECT SUM(qi.unit_price * ri.quantity) FROM quotation_items qi
        JOIN rfq_items ri ON qi.rfq_item_id = ri.id
        WHERE qi.quotation_id = q.id) as total_amount
       FROM quotations q
       JOIN vendors v ON q.vendor_id = v.id
       WHERE q.rfq_id = $1`,
      [req.params.rfq_id],
    );
    res.json(quotations.rows);
  } catch (err) {
    handleDbError(err, res);
  }
};

exports.getQuotationById = async (req, res) => {
  try {
    const quotation = await db.query("SELECT * FROM quotations WHERE id = $1", [
      req.params.id,
    ]);
    if (quotation.rows.length === 0) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    const items = await db.query(
      `SELECT qi.*, ri.product_name, ri.quantity, (qi.unit_price * ri.quantity) as calculated_total
       FROM quotation_items qi
       JOIN rfq_items ri ON qi.rfq_item_id = ri.id
       WHERE qi.quotation_id = $1`,
      [req.params.id],
    );

    res.json({ ...quotation.rows[0], items: items.rows });
  } catch (err) {
    handleDbError(err, res);
  }
};
