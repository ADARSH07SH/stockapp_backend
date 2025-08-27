require("dotenv").config();
const nodemailer = require("nodemailer");

(async () => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Ash Security" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, 
      subject: "Test OTP",
      text: "This is a test",
    });

    console.log("Message sent:", info.messageId);
  } catch (err) {
    console.error("Mailer error:", err);
  }
})();
