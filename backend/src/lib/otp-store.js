// Simple in-memory store — swap for Redis in production
const otpStore = new Map();

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

exports.saveOtp = (email, otp) => {
  otpStore.set(email, { otp, expiresAt: Date.now() + OTP_EXPIRY_MS });
};

exports.verifyOtp = (email, otp) => {
  const record = otpStore.get(email);
  if (!record) return { valid: false, reason: "No OTP sent for this email" };
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return { valid: false, reason: "OTP has expired. Please request a new one." };
  }
  if (record.otp !== otp) return { valid: false, reason: "Incorrect OTP" };
  otpStore.delete(email);
  return { valid: true };
};