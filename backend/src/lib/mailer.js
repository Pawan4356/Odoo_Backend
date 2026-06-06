const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,       // your gmail
    pass: process.env.GMAIL_APP_PASSWORD, // gmail app password (not your real password)
  },
});

exports.sendOtpEmail = async (toEmail, otp) => {
  // throws 550 synchronously if email doesn't exist
  await transporter.sendMail({
    from: `"VendorBridge" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: "Your OTP for VendorBridge",
    html: `
      <p>Your verification code is:</p>
      <h2>${otp}</h2>
      <p>Valid for 10 minutes. Do not share this.</p>
    `,
  });
};