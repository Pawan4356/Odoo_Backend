const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../lib/db");
const { handleDbError } = require("../lib/db-errors");

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const userExists = await db.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (userExists.rows.length > 0) {
      return res
        .status(409)
        .json({ message: "User with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await db.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
      [name, email, hashedPassword, role || "Vendor"],
    );

    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    handleDbError(err, res);
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const payload = { user: { id: user.rows[0].id, role: user.rows[0].role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "secret123", {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: {
        id: user.rows[0].id,
        name: user.rows[0].name,
        email: user.rows[0].email,
        role: user.rows[0].role,
      },
    });
  } catch (err) {
    handleDbError(err, res);
  }
};
