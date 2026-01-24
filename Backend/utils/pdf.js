import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { sendEmailWithPDF as sendEmailUtil } from "./email.js";

export const prescriptionPDF = async (conn, prescriptionId) => {
  const [[header]] = await conn.query(`
    SELECT p.name AS patient_name, p.email AS email, d.name AS doctor_name, pt.issued_days, MAX(pi.duration_days) AS duration_days
    FROM prescription_transaction pt
    JOIN prescription pr ON pt.prescription_id = pr.prescription_id
    JOIN visit v ON pr.visit_id = v.visit_id
    JOIN patient p ON v.patient_id = p.patient_id 
    JOIN doctor d ON pr.doctor_id = d.doctor_id
    JOIN prescription_items pi ON pi.prescription_id = pr.prescription_id
    WHERE pt.prescription_id = ?
    GROUP BY p.name, p.email, d.name, pt.issued_days;
  `, [prescriptionId]);

  const [medicines] = await conn.query(`
    SELECT m.name AS medicine_name, m.type AS medicine_type, pi.dosage_per_day
    FROM prescription_items pi
    JOIN medicine m ON pi.medicine_id = m.medicine_id
    WHERE pi.prescription_id = ?;
  `, [prescriptionId]);

  return { ...header, medicines };
};
 
// Generate prescription PDF with full design
export const generatePrescriptionPDF = (data) => {
  const timestamp = Date.now();
  const folderPath = path.join(process.cwd(), "prescriptionPDF");

  // Ensure folder exists
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

  const filePath = path.join(folderPath, `prescription_${timestamp}.pdf`);
  const doc = new PDFDocument({ margin: 50 });
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

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
  }

  doc.moveDown(5);
  doc.fontSize(20).font("Helvetica-Bold").text("Anna University Health Center", { align: "center" });
  doc.fontSize(14).font("Helvetica").text("Prescription", { align: "center" });
  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(1);

  // --- PATIENT / DOCTOR INFO ---
  doc.fontSize(12).font("Helvetica");
  doc.text(`Patient Name : ${toTitleCase(data.patient_name)}`);
  doc.text(`Doctor Name  : Dr. ${toTitleCase(data.doctor_name)}`);
  doc.text(`Prescribed duration days : ${data.duration_days} days`);
  doc.text(`Prescribed date : ${new Date().toLocaleDateString()}`);
  doc.moveDown(1);
  doc.text(`Issued Days  : ${data.issued_days} days`);
  doc.moveDown(1);

  // --- MEDICINES SECTION ---
  doc.fontSize(13).font("Helvetica-Bold").text("Medicines Prescribed");
  doc.moveDown(0.5);
  data.medicines.forEach((m, i) => {
    doc.fontSize(12).font("Helvetica-Bold").text(`${i + 1}. ${toTitleCase(m.medicine_name)} (${toTitleCase(m.medicine_type)})`);
    doc.text(`   Dosage per day : ${m.dosage_per_day}`);
    doc.moveDown(0.5);
  });

  // --- FOOTER / NOTE ---
  doc.moveDown(2);
  doc.fontSize(10).font("Helvetica-Oblique")
    .text("Note: Please follow the dosage strictly as prescribed by the doctor.", { align: "left" });

  doc.end();

  // ✅ Return a promise to await until PDF is fully written
  return new Promise((resolve, reject) => {
    writeStream.on("finish", () => resolve(filePath));
    writeStream.on("error", reject);
  });
};


export const sendEmailWithPDF = sendEmailUtil;
