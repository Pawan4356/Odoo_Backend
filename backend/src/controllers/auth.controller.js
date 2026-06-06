const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("../lib/db");
const { handleDbError } = require("../lib/db-errors");
const { saveOtp, verifyOtp } = require("../lib/otp-store");
const { sendOtpEmail } = require("../lib/mailer");


exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  // Basic format check before hitting EmailJS
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  try {
    // Check if email already registered
    const existing = await db.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "User with this email already exists" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    saveOtp(email, otp);

    await sendOtpEmail(email, otp);

    return res.status(200).json({ message: "OTP sent to your email" });
  } catch (err) {
    // EmailJS send failure
    console.error("EmailJS error:", err);
    return res.status(500).json({
      message: "Failed to send OTP. Please check the email address and try again.",
    });
  }
};

exports.register = async (req, res) => {
  const { name, email, password, role, otp } = req.body;

  if (!otp) {
    return res.status(400).json({ message: "OTP is required" });
  }

  // Verify OTP before doing anything else
  const { valid, reason } = verifyOtp(email, otp);
  if (!valid) {
    return res.status(400).json({ message: reason });
  }

  try {
    const userExists = await db.query("SELECT id FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
      return res.status(409).json({ message: "User with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await db.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
      [name, email, hashedPassword, role || "Vendor"]
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
