const db = require("../lib/db");
const { handleDbError } = require("../lib/db-errors");

exports.registerVendor = async (req, res) => {
  const { company_name, contact_person, phone, gst_details, category } =
    req.body;
  const user_id = req.user.id;

  try {
    const existing = await db.query(
      "SELECT id FROM vendors WHERE user_id = $1",
      [user_id],
    );
    if (existing.rows.length > 0) {
      return res
        .status(409)
        .json({ message: "You already have a vendor profile" });
    }

    const newVendor = await db.query(
      "INSERT INTO vendors (user_id, company_name, contact_person, phone, gst_details, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [user_id, company_name, contact_person, phone, gst_details, category],
    );
    res.status(201).json(newVendor.rows[0]);
  } catch (err) {
    handleDbError(err, res);
  }
};

exports.getVendors = async (req, res) => {
  try {
    const vendors = await db.query(
      "SELECT v.*, u.email FROM vendors v JOIN users u ON v.user_id = u.id",
    );
    res.json(vendors.rows);
  } catch (err) {
    handleDbError(err, res);
  }
};

exports.getVendorById = async (req, res) => {
  try {
    const vendor = await db.query(
      "SELECT v.*, u.email FROM vendors v JOIN users u ON v.user_id = u.id WHERE v.id = $1",
      [req.params.id],
    );
    if (vendor.rows.length === 0) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    res.json(vendor.rows[0]);
  } catch (err) {
    handleDbError(err, res);
  }
};
