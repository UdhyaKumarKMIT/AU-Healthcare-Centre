import nodemailer from "nodemailer";

export const sendEmailWithPDFStream = async (email, pdfStream) => {
  if (!pdfStream) throw new Error("Invalid PDF stream");

  const emailEnabled = String(process.env.EMAIL_ENABLED ?? "true").toLowerCase();
  if (emailEnabled === "false" || emailEnabled === "0" || emailEnabled === "no") {
    console.warn("EMAIL_ENABLED is disabled; skipping email send.");
    return null;
  }

  if (!email) throw new Error("Recipient email is required");

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT ?? "0");
  const smtpSecureEnv = process.env.SMTP_SECURE;
  const smtpUser = process.env.SMTP_USER ?? process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS ?? process.env.EMAIL_PASS;
  const fromAddress = process.env.SMTP_FROM ?? process.env.EMAIL_USER;

  if (!smtpUser || !smtpPass) {
    throw new Error("Email credentials are not configured (set SMTP_USER/SMTP_PASS or EMAIL_USER/EMAIL_PASS)");
  }

  const resolvedPort = smtpPort || (smtpHost ? 587 : 0);
  const resolvedSecure =
    typeof smtpSecureEnv === "string"
      ? smtpSecureEnv.toLowerCase() === "true"
      : resolvedPort === 465;

  const transporter = smtpHost
    ? nodemailer.createTransport({
      host: smtpHost,
      port: resolvedPort,
      secure: resolvedSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT_MS ?? 10000),
      greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT_MS ?? 10000),
      socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT_MS ?? 20000),
    })
    : nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT_MS ?? 10000),
      greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT_MS ?? 10000),
      socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT_MS ?? 20000),
    });

  try {
    const info = await transporter.sendMail({
      from: `"Anna University HealthCenter" <${fromAddress}>`,
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
    const msg = err?.message ? String(err.message) : String(err);
    throw new Error("Failed to send email: " + msg);
  }
};
