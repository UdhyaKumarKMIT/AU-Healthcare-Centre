import PDFDocument from "pdfkit";
import sequelize from "../config/sequelize.js";
import { QueryTypes } from "sequelize";
import { sendEmailWithPDFStream } from "./email.js";
import fs from "fs";
import path from "path";

/* ============================
   Fetch prescription data
============================ */
export const prescriptionPDF = async (transaction, prescriptionId) => {
  const headerRows = await sequelize.query(
    `
    SELECT
      p.name AS patient_name,
      p.patient_id AS pid,
      pu.username AS email,
      d.name AS doctor_name,
      pt.issued_days,
      MAX(pi.duration_days) AS duration_days
    FROM prescription_transaction pt
    JOIN prescription pr ON pt.prescription_id = pr.prescription_id
    JOIN visit v ON pr.visit_id = v.visit_id
    JOIN patient p ON v.patient_id = p.patient_id
    JOIN patient_users pu ON pu.patient_id = p.patient_id
    JOIN doctor d ON pr.doctor_id = d.doctor_id
    JOIN prescription_items pi ON pi.prescription_id = pr.prescription_id
    JOIN medicine m ON m.medicine_id = pi.medicine_id
    WHERE pt.prescription_id = ?
    GROUP BY
      p.name, p.patient_id, pu.username, d.name, pt.issued_days;
    `,
    { replacements: [prescriptionId], type: QueryTypes.SELECT, transaction }
  );

  const medicines = await sequelize.query(
    `
    SELECT
      m.name AS medicine_name,
      m.type AS medicine_type,
      pi.dosage_per_day,
      pi.food_timing,
      CAST(JSON_ARRAY(pi.morning, pi.afternoon, pi.night) AS CHAR) AS timing_flags
    FROM prescription_items pi
    JOIN medicine m ON pi.medicine_id = m.medicine_id
    WHERE pi.prescription_id = ?;
    `,
    { replacements: [prescriptionId], type: QueryTypes.SELECT, transaction }
  );

  const header = headerRows[0] || {};
  return { ...header, medicines };
};

/* ============================
   Generate PDF as a stream
============================ */
export const generatePrescriptionPDFStream = (data) => {
  const doc = new PDFDocument({ margin: 50 });

  const toTitleCase = (str) =>
    str.replace(/\w\S*/g, (txt) =>
      txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
    );

  // --- HEADER ---
  const logoPath = path.join(process.cwd(), "assets", "AULogo.jpg");
  if (fs.existsSync(logoPath)) {
    const logoWidth = 80;
    const x = (doc.page.width - logoWidth) / 2;
    doc.image(logoPath, x, doc.y, { width: logoWidth });
    doc.moveDown(5);
  }

  doc.fontSize(20).font("Helvetica-Bold").text("Anna University Health Center", { align: "center" });
  doc.fontSize(14).font("Helvetica").text("Prescription", { align: "center" });
  doc.moveDown(1);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(1);

  // --- PATIENT / DOCTOR INFO ---
  doc.fontSize(12).font("Helvetica");
  doc.text(`Patient ID : ${data.pid}`);
  doc.text(`Patient Name : ${toTitleCase(data.patient_name)}`);
  doc.text(`Doctor Name  : Dr. ${toTitleCase(data.doctor_name)}`);
  doc.text(`Prescribed duration days : ${data.duration_days} days`);
  doc.text(`Prescribed date : ${new Date().toLocaleDateString()}`);
  doc.moveDown(1);
  doc.text(`Issued Days  : ${data.issued_days} days`);
  doc.moveDown(1);

  // --- MEDICINES ---
  doc.fontSize(13).font("Helvetica-Bold").text("Medicines Prescribed");
  doc.moveDown(0.5);

  data.medicines.forEach((m, i) => {
    doc.fontSize(12).font("Helvetica-Bold").text(`${i + 1}. ${toTitleCase(m.medicine_name)} (${toTitleCase(m.medicine_type)})`);
    doc.fontSize(12).font("Helvetica").text(`   Dosage per day : ${m.dosage_per_day}`);

    if (m.food_timing) doc.text(`   Food Instruction:  ${toTitleCase(m.food_timing)}`);

    const timingFlags = JSON.parse(m.timing_flags);
    const morning = timingFlags?.[0] === 1 ? "[X]" : "[]";
    const afternoon = timingFlags?.[1] === 1 ? "[X]" : "[]";
    const night = timingFlags?.[2] === 1 ? "[X]" : "[]";

    doc.text(`   Timing:  ${morning} Morning   ${afternoon} Afternoon   ${night} Night`);
    doc.moveDown(0.8);
  });

  doc.moveDown(2);
  doc.fontSize(10).font("Helvetica-Oblique")
    .text("Note: Please follow the dosage strictly as prescribed by the doctor.", { align: "left" });

  doc.end();
  return doc; // return the PDFDocument stream directly
};

/* ============================
   Send PDF via email
============================ */
export const sendPrescriptionEmail = async (email, pdfStream) => {
  return await sendEmailWithPDFStream(email, pdfStream);
};
