const express = require("express");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const PasswordVerification = require("../models/passwordVerification.model");
const User = require("../models/user.model");

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post("/generate-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });

    const otp = crypto.randomInt(1000, 9999).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    await PasswordVerification.findOneAndUpdate(
      { email },
      { email, otp, otpExpiry: expiry, isVerified: false },
      { upsert: true, new: true }
    );

    const htmlTemplate = `
      <div style="font-family: 'Helvetica', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; background-color: #f9f9f9;">
        <div style="background-color: #4CAF50; padding: 20px; text-align: center; color: #fff;">
          <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="Logo" width="60" style="margin-bottom: 10px;" />
          <h1 style="margin: 0; font-size: 24px;">ASH Security</h1>
        </div>
        <div style="padding: 30px; text-align: center;">
          <p style="font-size: 16px; color: #333;">Hello,</p>
          <p style="font-size: 16px; color: #333;">Your One-Time Password (OTP) for resetting your password is:</p>
          <h2 style="font-size: 36px; color: #4CAF50; margin: 20px 0; letter-spacing: 5px;">${otp}</h2>
          <p style="font-size: 14px; color: #555;">This OTP is valid for <b>5 minutes</b>.</p>
          <p style="font-size: 14px; color: #555;">If you did not request a password reset, please ignore this email.</p>
        </div>
        <div style="background-color: #eee; padding: 15px; text-align: center; font-size: 12px; color: #888;">
          &copy; ${new Date().getFullYear()} ASH Security. All rights reserved.
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"ASH Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code - ASH Security",
      html: htmlTemplate,
    });

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

router.post("/check-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });

    const record = await PasswordVerification.findOne({ email });
    if (!record)
      return res
        .status(404)
        .json({ success: false, message: "No OTP found for this email" });
    if (record.isVerified)
      return res.json({ success: true, message: "Already verified" });
    if (record.otp !== otp)
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    if (record.otpExpiry < new Date())
      return res.status(400).json({ success: false, message: "OTP expired" });

    record.isVerified = true;
    await record.save();

    res.json({ success: true, message: "OTP verified successfully" });
  } catch {
    res
      .status(500)
      .json({ success: false, message: "OTP verification failed" });
  }
});

router.post("/reset", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword)
      return res.status(400).json({
        success: false,
        message: "Email and new password are required",
      });

    const record = await PasswordVerification.findOne({ email });
    if (!record || !record.isVerified)
      return res
        .status(400)
        .json({ success: false, message: "OTP not verified" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email }, { password: hashedPassword });

    await PasswordVerification.deleteOne({ email });

    res.json({ success: true, message: "Password reset successfully" });
  } catch {
    res.status(500).json({ success: false, message: "Password reset failed" });
  }
});

module.exports = router;
