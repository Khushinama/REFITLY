import dotenv from "dotenv";
import nodemailer from "nodemailer";

// ✅ Load env variables
dotenv.config();

const sendEmail = async (to, subject, html) => {
  try {
    // ✅ Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST?.trim(),
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER?.trim(),
        pass: process.env.EMAIL_PASS?.trim(),
      },
    });

    // ✅ Mail options
    const mailOptions = {
      from: `"ReFitly" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    };

    // ✅ Send email
    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent:", info.messageId);
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    throw new Error("Email sending failed");
  }
};

export default sendEmail;