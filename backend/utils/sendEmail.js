import dotenv from "dotenv";
import axios from "axios";

// ✅ Load env variables
dotenv.config();

const sendEmail = async (to, subject, html) => {
  // Use BREVO_API_KEY, fallback to EMAIL_PASS if it happens to be a valid API key
  const apiKey = process.env.BREVO_API_KEY || process.env.EMAIL_PASS;

  if (!apiKey) {
    console.error("❌ Email configuration is missing in environment variables.");
    throw new Error("Server configuration error: Email API Key not setup.");
  }

  try {
    const payload = {
      sender: {
        name: "ReFitly",
        email: process.env.EMAIL_FROM || "khushinama2006@gmail.com",
      },
      to: [
        {
          email: to,
        },
      ],
      subject: subject,
      htmlContent: html,
    };

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      payload,
      {
        headers: {
          "api-key": apiKey.trim(),
          "accept": "application/json",
          "content-type": "application/json",
        },
      }
    );

    console.log("✅ Email sent via Brevo API:", response.data);
  } catch (error) {
    console.error("❌ Email sending failed:", error.response?.data || error.message);
    throw new Error("Email sending failed. Please try again later.");
  }
};

export default sendEmail;