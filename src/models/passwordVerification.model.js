const mongoose = require("mongoose");

const passwordVerificationSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  otpExpiry: { type: Date, required: true },
  isVerified: { type: Boolean, default: false },
});

const PasswordVerification = mongoose.model(
  "PasswordVerification",
  passwordVerificationSchema
);

module.exports = PasswordVerification;
