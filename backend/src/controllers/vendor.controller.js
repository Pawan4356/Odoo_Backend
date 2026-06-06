const db = require("../lib/db");
const { handleDbError } = require("../lib/db-errors");
const bcrypt = require("bcryptjs");

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

exports.getMyVendorProfile = async (req, res) => {
  try {
    const vendor = await db.query(
      "SELECT v.*, u.email FROM vendors v JOIN users u ON v.user_id = u.id WHERE v.user_id = $1",
      [req.user.id],
    );
    res.json(vendor.rows[0] || null);
  } catch (err) {
    handleDbError(err, res);
  }
};

exports.updateMyVendorProfile = async (req, res) => {
  const { company_name, contact_person, phone, gst_details, category } =
    req.body;
  const user_id = req.user.id;

  try {
    const existing = await db.query(
      "SELECT id FROM vendors WHERE user_id = $1",
      [user_id],
    );

    let vendor;
    if (existing.rows.length === 0) {
      vendor = await db.query(
        "INSERT INTO vendors (user_id, company_name, contact_person, phone, gst_details, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [user_id, company_name, contact_person, phone, gst_details, category],
      );
    } else {
      vendor = await db.query(
        `UPDATE vendors
         SET company_name = $1, contact_person = $2, phone = $3, gst_details = $4, category = $5
         WHERE user_id = $6
         RETURNING *`,
        [company_name, contact_person, phone, gst_details, category, user_id],
      );
    }

    res.json(vendor.rows[0]);
  } catch (err) {
    handleDbError(err, res);
  }
};

exports.createVendorByStaff = async (req, res) => {
  const {
    name,
    email,
    password,
    company_name,
    contact_person,
    phone,
    gst_details,
    category,
  } = req.body;

  try {
    const userExists = await db.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (userExists.rows.length > 0) {
      return res
        .status(409)
        .json({ message: "User with this email already exists" });
    }

    await db.query("BEGIN");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await db.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, email",
      [name || contact_person || company_name, email, hashedPassword, "Vendor"],
    );

    const vendor = await db.query(
      `INSERT INTO vendors (user_id, company_name, contact_person, phone, gst_details, category)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        user.rows[0].id,
        company_name,
        contact_person,
        phone,
        gst_details,
        category,
      ],
    );

    await db.query(
      "INSERT INTO activity_logs (user_id, action, target_type, target_id) VALUES ($1, $2, $3, $4)",
      [req.user.id, `Vendor ${company_name} created`, "VENDOR", vendor.rows[0].id],
    );

    await db.query("COMMIT");
    res.status(201).json({ ...vendor.rows[0], email: user.rows[0].email });
  } catch (err) {
    await db.query("ROLLBACK");
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

exports.updateVendorStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!["Active", "Pending", "Removed", "Blacklisted"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value." });
  }

  try {
    await db.query("BEGIN");
    
    const result = await db.query(
      "UPDATE vendors SET status = $1 WHERE id = $2 RETURNING user_id, company_name",
      [status, id]
    );

    if (result.rows.length === 0) {
      await db.query("ROLLBACK");
      return res.status(404).json({ message: "Vendor not found" });
    }

    const { user_id, company_name } = result.rows[0];

    if (status === "Blacklisted" || status === "Removed") {
      await db.query("UPDATE users SET status = 'Inactive' WHERE id = $1", [user_id]);
    } else if (status === "Active") {
      await db.query("UPDATE users SET status = 'Active' WHERE id = $1", [user_id]);
    }

    await db.query(
      "INSERT INTO activity_logs (user_id, action, target_type, target_id) VALUES ($1, $2, $3, $4)",
      [req.user.id, `Vendor ${company_name} status updated to ${status}`, "VENDOR", id],
    );

    await db.query("COMMIT");
    res.json({ message: `Vendor status updated to ${status}` });
  } catch (err) {
    await db.query("ROLLBACK");
    handleDbError(err, res);
  }
};
