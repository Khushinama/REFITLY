import sendEmail from "../backend/utils/sendEmail.js";

async function testEmail() {
  try {
    console.log("Testing email sending...");
    await sendEmail("khushinama2006@gmail.com", "ReFitly Test Email", "<h1>Migration Successful</h1><p>This is a test email from Brevo SMTP.</p>");
    console.log("Test completed.");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testEmail();
