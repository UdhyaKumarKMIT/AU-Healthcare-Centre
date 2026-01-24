import nodemailer from "nodemailer";
import fs from "fs";

export const sendEmailWithPDF = async (email, pdfPath) => {
  if (!fs.existsSync(pdfPath)) {
    throw new Error("PDF file does not exist: " + pdfPath);
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // or App Password
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"Anna University HealthCenter" <${process.env.EMAIL_USER}>`,
      to: "r.sooryaprakash2704@gmail.com",
      subject: "Prescription from Anna University HealthCenter",
      text: "Please find your prescription attached.",
      attachments: [
        {
          filename: `prescription.pdf`,
          path: pdfPath,
        },
      ],
    });

    // Nodemailer returns accepted/rejected arrays
    if (info.rejected.length > 0) {
      throw new Error(`Email rejected for recipients: ${info.rejected.join(", ")}`);
    }

    // Email successfully sent
    console.log("Email sent successfully:", info.messageId);
    return info.messageId;

  } catch (err) {
    console.error("Email sending failed:", err);
    throw new Error("Failed to send email: " + err.message);
  }
};
