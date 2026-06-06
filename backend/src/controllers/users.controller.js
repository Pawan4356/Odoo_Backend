const db = require("../lib/db");
const bcrypt = require("bcryptjs");
const { handleDbError } = require("../lib/db-errors");

exports.getUsers = async (req, res) => {
  try {
    const users = await db.query(
      `SELECT id, name, email, role, status, created_at FROM users ORDER BY created_at DESC`,
    );
    res.json(users.rows);
  } catch (err) {
    handleDbError(err, res);
  }
};

exports.createUser = async (req, res) => {
  const { name, email, role, password } = req.body;
  try {
    const existing = await db.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "Email already in use." });
    }
    
    const hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      "INSERT INTO users (name, email, role, password_hash, status) VALUES ($1, $2, $3, $4, 'Active') RETURNING id, name, email, role, status, created_at",
      [name, email, role || "Vendor", hash]
    );

    // If it's a vendor, we should probably create a vendor profile automatically but for admin control, 
    // it's better if they just use standard vendor sign-up. 
    // But we'll leave it simple for now.

    res.status(201).json(result.rows[0]);
  } catch (err) {
    handleDbError(err, res);
  }
};

exports.updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status, role } = req.body;
  
  try {
    let updateQuery = "UPDATE users SET ";
    const params = [];
    let idx = 1;

    if (status) {
      updateQuery += `status = $${idx++} `;
      params.push(status);
    }
    if (role) {
      if (params.length > 0) updateQuery += ", ";
      updateQuery += `role = $${idx++} `;
      params.push(role);
    }

    if (params.length === 0) return res.status(400).json({ message: "No fields to update." });

    updateQuery += `WHERE id = $${idx} RETURNING id, name, email, role, status`;
    params.push(id);

    const result = await db.query(updateQuery, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(result.rows[0]);
  } catch (err) {
    handleDbError(err, res);
  }
};

exports.resetPassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  try {
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }
    const hash = await bcrypt.hash(newPassword, 10);
    const result = await db.query(
      "UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id",
      [hash, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ message: "Password reset successfully." });
  } catch (err) {
    handleDbError(err, res);
  }
};
