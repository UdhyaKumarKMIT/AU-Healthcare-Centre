import nodemailer from "nodemailer";

export const sendEmailWithPDFStream = async (email, pdfStream) => {
  if (!pdfStream) throw new Error("Invalid PDF stream");

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
      to: email,
      subject: "Prescription from Anna University HealthCenter",
      text: "Please find your prescription attached.",
      attachments: [
        {
          filename: "prescription.pdf",
          content: pdfStream, // stream directly
          contentType: "application/pdf",
        },
      ],
    });

    console.log("Email sent successfully:", info.messageId);
    return info.messageId;

  } catch (err) {
    console.error("Email sending failed:", err);
    throw new Error("Failed to send email: " + err.message);
  }
};
