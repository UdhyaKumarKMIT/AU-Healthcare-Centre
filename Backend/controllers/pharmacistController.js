import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

// REGISTER
export const register = async (req, res) => {
  const { user_id, name, email, phone, password } = req.body;
  if (!user_id || !name || !email || !password)
    return res.status(400).json({ message: "Missing fields" });

  try {
    const [existing] = await pool.query(
      "SELECT * FROM pharmacist WHERE email = ?",
      [email]
    );
    if (existing.length)
      return res.status(409).json({ message: "Email already exists" });

    const password_hash = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO pharmacist (user_id, name, email, phone, password_hash) VALUES (?, ?, ?, ?, ?)",
      [user_id, name, email, phone || null, password_hash]
    );

    res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Missing fields" });

  try {
    const [rows] = await pool.query(
      "SELECT * FROM pharmacist WHERE email = ?",
      [email]
    );
    
    if (rows.length === 0)
      return res.status(401).json({ message: "Invalid credentials" });

    const pharmacist = rows[0];
    const match = await bcrypt.compare(password, pharmacist.password_hash);
    if (!match)
      return res.status(401).json({ message: "Invalid credentials" });

    // Create JWT token
    const token = jwt.sign(
      { pharmacist_id: pharmacist.pharmacist_id, role: "PHARMACIST" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Send token + pharmacist_id in the response
    res.json({
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// GET PHARMACIST DETAILS (NEW)
export const getPharmacistDetails = async (req, res) => {
  const pharmacistId = req.user.pharmacist_id; // set by auth middleware 
  try {
    const [rows] = await pool.query(
      `SELECT pharmacist_id, name, email, phone
       FROM pharmacist
       WHERE pharmacist_id = ?`,
      [pharmacistId]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Pharmacist not found" });
    
    res.json(rows[0]);
  } catch (err) {
    console.error("Fetch pharmacist details error:", err);
    res.status(500).json({ message: "Unable to fetch pharmacist details" });
  }
};

// GET ALL PRESCRIPTIONS
export const getAllPrescriptions = async (req, res) => {
  try {
    const [rows] = await pool.query(`
  SELECT DISTINCT
    pp.prescription_id, 
    p.name AS patient_name,
    d.name AS doctor_name,
    d.specialization AS doctor_specialization,
    pp.status,
    pp.created_at
  FROM prescription pp
  JOIN visit v
    ON pp.visit_id = v.visit_id
  JOIN patient_profile p
    ON v.patient_id = p.patient_id
  JOIN doctor d
    ON pp.doctor_id = d.doctor_id
  WHERE pp.status = 'PENDING'
  ORDER BY pp.created_at ASC
`);  
    res.status(200).json(rows);
  } catch (err) {
    console.error("Fetch pending prescriptions error:", err);
    res.status(500).json({ message: "Unable to fetch prescriptions" });
  }
};




// GET PRESCRIPTION DETAILS
export const getPrescriptionDetails = async (req, res) => {
  const { id } = req.query;  

  try {
    const [rows] = await pool.query(
      `
      SELECT DISTINCT 
    pat.name AS patient_name,
    d.name AS doctor_name, 
    pi.duration_days AS duration_days,
    pi.food,
    pi.morning,
    pi.afternoon,
    pi.night,
    m.name AS medicine_name,
    m.type AS medicine_type
FROM prescription pp
JOIN visit v
    ON v.visit_id = pp.visit_id
JOIN patient_profile pat
    ON pat.patient_id = v.patient_id
JOIN doctor d
    ON d.doctor_id = pp.doctor_id
JOIN prescription_items pi
    ON pi.prescription_id = pp.prescription_id
JOIN medicine m
    ON m.medicine_id = pi.medicine_id
WHERE pp.prescription_id = ?;
      `,
      [id]
    );

    const [batches] = await pool.query(`SELECT
    m.name AS medicine_name,
    mb.batch_id
FROM prescription_items pi
JOIN medicine m
    ON m.medicine_id = pi.medicine_id
JOIN medicine_batch mb
    ON mb.medicine_id = pi.medicine_id
WHERE pi.prescription_id = ?
  AND mb.status = 'ACTIVE'
  AND mb.in_stock > 0
GROUP BY
    m.name,
    mb.batch_id`, [id] );

    // Extract patient_name once
    const patientName = rows.length > 0 ? rows[0].patient_name : null;
    const doctorName = rows.length > 0 ? rows[0].doctor_name : null;

    // Extract items only
    const items = rows.map(row => ({ 
      medicine_name: row.medicine_name,
      medicine_type: row.medicine_type,
      duration_days: row.duration_days,
      food: row.food,
      timing: {
        morning: row.morning,
        afternoon: row.afternoon,
        night: row.night
      }
    }));

    const batchIds = batches.map(row => ({
      medicine_name: row.medicine_name,
      batch_id: row.batch_id
    }));

    res.status(200).json({
      patient_name: patientName,
      doctor_name: doctorName,
      items,
      batchIds
    });
  } catch (err) {
    console.error("Fetch prescription details error:", err);
    res.status(500).json({ message: "Unable to fetch prescription details" });
  }
};

// ISSUE MEDICINE 
export const issueMedicine = async (req , res) => {
  const pharmacistId = req.user.pharmacist_id; // from auth middleware
  const { prescription_id, issued_days, batches } = req.body; 
  // batches = [{ batch_id: string, quantity: number }, ...]

  if (!prescription_id || !issued_days || !batches || !batches.length) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // --- Step 1: Validate and reduce stock for each batch ---
    for (const batch of batches) {
      const [rows] = await conn.query(
        `SELECT in_stock FROM medicine_batch WHERE batch_id = ? FOR UPDATE`,
        [batch.batch_id]
      );

      if (!rows.length) {
        throw new Error(`Batch ID ${batch.batch_id} not found`);
      }

      const inStock = rows[0].in_stock;
      if (inStock < batch.quantity) {
        throw new Error(
          `Insufficient stock for batch ${batch.batch_id}. Available: ${inStock}`
        );
      }

      // Reduce stock
      await conn.query(
        `UPDATE medicine_batch SET in_stock = in_stock - ? WHERE batch_id = ?`,
        [batch.quantity, batch.batch_id]
      );

      // If stock becomes 0, remove batch
      if (inStock === batch.quantity) {
        await conn.query(`DELETE FROM medicine_batch WHERE batch_id = ?`, [
          batch.batch_id,
        ]);
      }
    }

    // --- Step 2: Delete previous transaction if exists (optional) ---
    await conn.query(
      `DELETE FROM pharmacy_transaction WHERE prescription_id = ?`,
      [prescription_id]
    );

    // --- Step 3: Insert new transaction ---
    const [result] = await conn.query(
      `INSERT INTO pharmacy_transaction
       (prescription_id, pharmacist_id, issued_days)
       VALUES (?, ?, ?)`,
      [prescription_id, pharmacistId, issued_days]
    );
 
    // --- Step 4: Update prescription status ---
    await conn.query(
      `UPDATE prescription SET status = 'ISSUED' WHERE prescription_id = ?`,
      [prescription_id]
    );

    // --- Step 5: Generate PDF and send email if available ---
    const details = await prescriptionPDF(conn, prescription_id);
    const pdfPath = generatePrescriptionPDF(details);

    if (details.email) {
      await sendEmailWithPDF(details.email, pdfPath);
    }

    await conn.commit();

    res.json({ message: "Medicine issued successfully" });
  } catch (err) {
    await conn.rollback();
    console.error("Issue medicine error:", err.message);
    res.status(400).json({ message: err.message });
  } finally {
    conn.release();
  }
};


// UPDATE PHARMACIST DETAILS
export const updatePharmacistDetails = async (req, res) => {
  const pharmacistId = req.user.pharmacist_id; // set by auth middleware
  const { name, email, phone } = req.body;

  if (!name && !email && !phone) {
    return res.status(400).json({ message: "At least one field is required to update" });
  }

  try {
    // Check if email is being updated and already exists
    if (email) {
      const [existing] = await pool.query(
        "SELECT * FROM pharmacist WHERE email = ? AND pharmacist_id != ?",
        [email, pharmacistId]
      );
      if (existing.length) {
        return res.status(409).json({ message: "Email already in use" });
      }
    }

    // Build dynamic query based on fields provided
    const fields = [];
    const values = [];

    if (name) {
      fields.push("name = ?");
      values.push(name);
    }
    if (email) {
      fields.push("email = ?");
      values.push(email);
    }
    if (phone) {
      fields.push("phone = ?");
      values.push(phone);
    }

    values.push(pharmacistId); // for WHERE clause

    const query = `UPDATE pharmacist SET ${fields.join(", ")} WHERE pharmacist_id = ?`;

    const [result] = await pool.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Pharmacist not found" });
    }

    res.json({ message: "Pharmacist details updated successfully" });
  } catch (err) {
    console.error("Update pharmacist details error:", err);
    res.status(500).json({ message: "Unable to update pharmacist details" });
  }
};

// Past Transactions
export const getTransactions = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
          pt.prescription_id, 
          pt.issued_days,
          pt.issued_at,
          ph.name AS pharmacist_name,
          d.name AS doctor_name,
          d.specialization AS doctor_specialization,
          p.name AS patient_name
      FROM pharmacy_transaction pt
      JOIN pharmacist ph
          ON pt.pharmacist_id = ph.pharmacist_id
      JOIN prescription pp
          ON pt.prescription_id = pp.prescription_id
      JOIN doctor d
          ON pp.doctor_id = d.doctor_id
      JOIN visit v
          ON pp.visit_id = v.visit_id
      JOIN patient_profile p
          ON v.patient_id = p.patient_id
      ORDER BY pt.issued_at ASC;
      `
    );

    if (rows.length === 0) {
      res.status(200).json(rows);
      return;
    }

    const transactions = rows.map(row => ({
      patient_name: row.patient_name,
      doctor_name: row.doctor_name,
      name: row.pharmacist_name,
      issued_at: row.issued_at,
      prescription_id: row.prescription_id,
      issued_days: row.issued_days,
      specialization: row.doctor_specialization
    }));

    res.status(200).json(transactions);

  } catch (err) {
    console.error("Fetch all transaction details error:", err);
    res.status(500).json({ message: "Unable to fetch transaction details" });
  }
};

export const getTransactionDetails = async (req, res) => { 
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
     `
     SELECT
    m.name AS medicine_name, 
    m.type AS medicine_type,
    ppi.duration_days AS duration_days,
    ppi.food,
    ppi.morning,
    ppi.afternoon,
    ppi.night,
    pt.issued_days
FROM prescription_items ppi
JOIN medicine m
    ON m.medicine_id = ppi.medicine_id
JOIN pharmacy_transaction pt
    ON pt.prescription_id = ppi.prescription_id
WHERE ppi.prescription_id = ?;
     `
     , [id]
    );

    // Extract items only
    const items = rows.map(row => ({  
      medicine_name: row.medicine_name,
      medicine_type: row.medicine_type,
      duration_days: row.duration_days,  
      food: row.food,
      morning: row.morning,
      afternoon: row.afternoon,
      night: row.night, 
      issued_days: row.issued_days
    })); 

    res.status(200).json({ 
      items
    });
  } catch (err) {
    console.error("Fetch prescription details error:", err);
    res.status(500).json({ message: "Unable to fetch prescription details" });
  }
};

export const getMedicineDetails = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT 
      m.medicine_id,
      m.name AS medicine_name,
      m.type AS medicine_type,
      mb.batch_id,
      mb.expiry_date,
      mb.in_stock
  FROM medicine m
  LEFT JOIN medicine_batch mb
      ON m.medicine_id = mb.medicine_id
      AND mb.status = 'ACTIVE'
      AND mb.in_stock > 0
  ORDER BY m.name, mb.expiry_date;
      `
    );

    // Group batches under each medicine
    const medicines = {};
    rows.forEach(row => {
      if (!medicines[row.medicine_name]) {
        medicines[row.medicine_name] = {
          type: row.medicine_type,
          batches: []
        };
      }
      if (row.batch_id) {
        medicines[row.medicine_name].batches.push({
          batch_id: row.batch_id,
          expiry_date: row.expiry_date,
          in_stock: row.in_stock
        });
      }
    });

    res.status(200).json({ medicines });
  } catch (err) {
    console.error("Fetch medicine batches error:", err);
    res.status(500).json({ message: "Unable to fetch medicine batches" });
  }
};

export const addMedicineBatch = async (req, res) => {
  try {
    const {
      batch_id,
      medicine_name,
      expiry_date,
      in_stock
    } = req.body;

    const pharmacistId = req.user.pharmacist_id; 

    const [result] = await pool.query(
      `
      INSERT INTO medicine_batch (
          batch_id,
          medicine_id,
          expiry_date,
          in_stock,
          pharmacist_id
      )
      SELECT
          ?,
          m.medicine_id,
          ?,
          ?,
          ?
      FROM medicine m
      WHERE m.name = ?;
      `,
      [
        batch_id,
        expiry_date,
        in_stock,
        pharmacistId,
        medicine_name
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    res.status(201).json({
      message: "Medicine batch added successfully"
    });

  } catch (err) {
    console.error("Add medicine batch error:", err);
    res.status(500).json({ message: "Unable to add medicine batch" });
  }
};

export const getExpiredMedicineBatches = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        mb.batch_id,
        m.name AS medicine_name,
        DATE(mb.expiry_date) AS expiry_date,
        mb.in_stock
      FROM medicine_batch mb
      INNER JOIN medicine m
        ON mb.medicine_id = m.medicine_id
      WHERE mb.status = 'EXPIRED'
      ORDER BY mb.expiry_date ASC;
      `
    );

    const items = rows.map(row => ({  
      batch_id: row.batch_id, 
      expiry_date: row.expiry_date,
      in_stock: row.in_stock,
      medicine_name: row.medicine_name
    }));

    res.status(200).json({
      items 
    });

  } catch (err) {
    console.error("Fetch expired medicine batches error:", err);
    res.status(500).json({
      message: "Unable to fetch expired medicine batches"
    });
  }
};

export const clearMedicineBatch = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { batch_id } = req.params;
    const clearedPharmacistId = req.user.pharmacist_id;

    await connection.beginTransaction();
 
    const [insertResult] = await connection.query(
      `
      INSERT INTO medicine_log (
        batch_id,
        medicine_id,
        expiry_date,
        in_stock,
        pharmacist_id,
        cleared_pharmacist_id
      )
      SELECT
        batch_id,
        medicine_id,
        expiry_date,
        in_stock,
        pharmacist_id,
        ?
      FROM medicine_batch
      WHERE batch_id = ?;
      `,
      [clearedPharmacistId, batch_id]
    );

    if (insertResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Batch not found" });
    }
 
    await connection.query(
      `
      DELETE FROM medicine_batch
      WHERE batch_id = ?;
      `,
      [batch_id]
    );

    await connection.commit();

    res.status(200).json({
      message: "Medicine batch cleared and logged successfully"
    });

  } catch (err) {
    await connection.rollback();
    console.error("Clear medicine batch error:", err);

    res.status(500).json({
      message: "Unable to clear medicine batch"
    });

  } finally {
    connection.release();
  }
};

export const addMedicine = async (req, res) => {
  const {
    name,
    type,
    batch_id,
    expiry_date,
    in_stock
  } = req.body;

  const pharmacistId = req.user.pharmacist_id; 

  if (!name || !type || !batch_id || !expiry_date || !in_stock) {
    return res.status(400).json({ message: "Missing required fields" });
  }
 

  try {
    const connection = await pool.getConnection();

    /* ---------- 1. INSERT MEDICINE ---------- */
    const [medicineResult] = await connection.query(
      `INSERT INTO medicine (name, type)
       VALUES (?, ?)`,
      [name, type]
    );

    const medicine_id = medicineResult.insertId;

    /* ---------- 2. INSERT BATCH ---------- */
    await connection.query(
      `INSERT INTO medicine_batch
       (batch_id, medicine_id, expiry_date, in_stock, status, pharmacist_id)
       VALUES (?, ?, ?, ?, 'ACTIVE', ?)`,
      [
        batch_id,
        medicine_id,
        expiry_date,
        in_stock,
        pharmacistId
      ]
    );

    await connection.commit();

    return res.status(201).json({
      message: "Medicine and stock added successfully",
      medicine_id
    });

  } catch (error) {
    await connection.rollback();
    console.error("Add medicine error:", error);

    return res.status(500).json({
      message: "Failed to add medicine",
      error: error.message
    });

  } finally {
    connection.release();
  }
};
 
export const deleteMedicineBatch = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { batch_id } = req.params;
    const pharmacistId = req.user.pharmacist_id;

    await connection.beginTransaction();

    // 1️⃣ Insert into medicine_stock_log before deleting
    const [insertResult] = await connection.query(
      `
      INSERT INTO medicine_stock_log (
        medicine_id,
        batch_id,
        pharmacist_id
      )
      SELECT
        medicine_id,
        batch_id,
        ?
      FROM medicine_batch
      WHERE batch_id = ?;
      `,
      [pharmacistId, batch_id]
    );

    if (insertResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Batch not found" });
    }

    // 2️⃣ Delete from medicine_batch
    await connection.query(
      `
      DELETE FROM medicine_batch
      WHERE batch_id = ?;
      `,
      [batch_id]
    );

    await connection.commit();

    res.status(200).json({
      message: "Medicine batch deleted and logged successfully"
    });

  } catch (err) {
    await connection.rollback();
    console.error("Delete medicine batch error:", err);

    res.status(500).json({
      message: "Unable to delete medicine batch"
    });

  } finally {
    connection.release();
  }
};

const prescriptionPDF = async (conn, prescriptionId) => {
  const [[header]] = await conn.query(
    `
    SELECT 
  p.name AS patient_name,
  u.email AS email,
  d.name AS doctor_name,
  pt.issued_days
FROM pharmacy_transaction pt
JOIN prescription pr
  ON pt.prescription_id = pr.prescription_id
JOIN visit v
  ON pr.visit_id = v.visit_id
JOIN patient_profile p
  ON v.patient_id = p.patient_id
JOIN users u
  ON p.user_id = u.user_id
JOIN doctor d
  ON pr.doctor_id = d.doctor_id
WHERE pt.prescription_id = ?;

    `,
    [prescriptionId]
  );

  const [medicines] = await conn.query(
    `
    SELECT 
      m.name AS medicine_name,
      pi.morning,
      pi.afternoon,
      pi.night,
      pi.duration_days AS duration_days,
      pi.food
    FROM prescription_items pi
    JOIN medicine m ON pi.medicine_id = m.medicine_id
    WHERE pi.prescription_id = ?
    `,
    [prescriptionId]
  );

  return { ...header, medicines };
};

const generatePrescriptionPDF = (data) => {
  const timestamp = Date.now();


  // Ensure folder exists
  const folderPath = path.join(process.cwd(), "prescriptionPDF");
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }

  const filePath = path.join(
    folderPath,
    `prescription_${timestamp}.pdf`
  );
  
  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(fs.createWriteStream(filePath));

  /* ---------- HEADER ---------- */

  const logoPath = path.join(process.cwd(), "assets", "AULogo.jpg");

  if (fs.existsSync(logoPath)) {
  const logoWidth = 80;
  const pageWidth = doc.page.width;

  const x = (pageWidth - logoWidth) / 2;

  doc.image(logoPath, x, doc.y, {
    width: logoWidth
  });
}

  doc.moveDown(5);

  doc
    .fontSize(20)
    .font("Helvetica-Bold")
    .text("Anna University Health Center", {
      align: "center"
    });

  doc
    .fontSize(14)
    .font("Helvetica")
    .text("Prescription", { align: "center" });

  doc.moveDown(0.5);

  doc
    .moveTo(50, doc.y)
    .lineTo(550, doc.y)
    .stroke();

  doc.moveDown(1);



  /* ---------- PATIENT / DOCTOR INFO ---------- */
  doc.fontSize(12).font("Helvetica");

  doc.text(`Patient Name : ${data.patient_name}`);
  doc.text(`Doctor Name  : ${data.doctor_name}`);
  doc.text(`Issued For   : ${data.issued_days} days`);
  doc.text(`Date         : ${new Date().toLocaleDateString()}`);

  doc.moveDown(1);

  /* ---------- MEDICINE SECTION ---------- */
  doc
    .fontSize(13)
    .font("Helvetica-Bold")
    .text("Medicines Prescribed");

  doc.moveDown(0.5);

  data.medicines.forEach((m, i) => {
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(`${i + 1}. ${m.medicine_name}`);

    doc
      .fontSize(11)
      .font("Helvetica")
      .text(
        `   Dosage      : ${m.morning} - ${m.afternoon} - ${m.night}`
      );

    doc.text(`   Duration    : ${m.duration_days} days`);
    doc.text(`   Instruction : ${m.food === 1 ? "After Food" : "Before Food"}`);

    doc.moveDown(0.5);
  });

  /* ---------- FOOTER ---------- */
  doc.moveDown(2);

  doc
    .fontSize(10)
    .font("Helvetica-Oblique")
    .text(
      "Note: Please follow the dosage strictly as prescribed by the doctor.",
      { align: "left" }
    );

  doc.moveDown(2);

  doc.moveDown(0.5);
 
  doc.end();
  return filePath;
};


const sendEmailWithPDF = async (email, pdfPath) => {
  const timestamp = new Date().toISOString().split("T")[0];
  
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Anna University HealthCenter" <${process.env.EMAIL_USER}>`,
    to: "r.sooryaprakash2704@gmail.com",
    subject: "Prescription from Anna University HealthCenter",
    text: "Please find your prescription attached.",
    attachments: [
      {
        filename: `prescription_${timestamp}.pdf`,
        path: pdfPath,
      },
    ],
  });
};

export const updateStockStatus = async () => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();  

    // Update expired batches
    const [updateResult] = await connection.query(
      `
      UPDATE medicine_batch
      SET status = 'EXPIRED'
      WHERE expiry_date < CURDATE() AND status = 'ACTIVE';
      `
    ); 

    await connection.commit();

    console.log(`Stock status updated. Expired batches: ${updateResult.affectedRows}`);

  } catch (err) {
    await connection.rollback();
    console.error("Update stock status error:", err);

  } finally {
    connection.release();
  }
};

export const getBatches = async (req, res) => {
  const { medicine_name, duration_days, quantity } = req.query;

  if (!medicine_name || !duration_days || !quantity) {
    return res.status(400).json({ message: "Missing parameters" });
  }

  const conn = await pool.getConnection();

  try {
    // 🔹 GET medicine_id FROM medicine_name
    const [medicineRows] = await conn.query(
      `
      SELECT medicine_id
      FROM medicine
      WHERE name = ?
      `,
      [medicine_name]
    );

    if (medicineRows.length === 0) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    const medicine_id = medicineRows[0].medicine_id;

    let batches = [];

    // 🔹 CASE 1: duration >= 30 → ONLY 3+ months expiry
    if (Number(duration_days) >= 30) {
      const [rows] = await conn.query(
        `
        SELECT batch_id, in_stock, expiry_date
        FROM medicine_batch
        WHERE medicine_id = ?
          AND in_stock > 0
          AND status = 'ACTIVE'
          AND expiry_date >= DATE_ADD(CURDATE(), INTERVAL 3 MONTH)
        ORDER BY expiry_date ASC
        `,
        [medicine_id]
      );
      batches = rows;
    }

    // 🔹 CASE 2: duration < 30 → 1 month first, then 3+ months
    else {
      const [nearExpiry] = await conn.query(
        `
        SELECT batch_id, in_stock, expiry_date
        FROM medicine_batch
        WHERE medicine_id = ?
          AND in_stock > 0
          AND status = 'ACTIVE'
          AND expiry_date < DATE_ADD(CURDATE(), INTERVAL 1 MONTH)
        ORDER BY expiry_date ASC
        `,
        [medicine_id]
      );

      const [longExpiry] = await conn.query(
        `
        SELECT batch_id, in_stock, expiry_date
        FROM medicine_batch
        WHERE medicine_id = ?
          AND in_stock > 0
          AND expiry_date >= DATE_ADD(CURDATE(), INTERVAL 3 MONTH)
        ORDER BY expiry_date ASC
        `,
        [medicine_id]
      );

      batches = [...nearExpiry, ...longExpiry];
    }

    // 🔹 COLLECT BATCHES UNTIL QUANTITY SATISFIED
    let remainingQty = Number(quantity);
    const selectedBatches = [];

    for (const batch of batches) {
      if (remainingQty <= 0) break;

      const usedQty = Math.min(batch.in_stock, remainingQty);

      selectedBatches.push({
        batch_id: batch.batch_id,
        available: batch.in_stock,
        used: usedQty,
        expiry_date: batch.expiry_date,
      });

      remainingQty -= usedQty;
    }

    // 🔴 If stock not sufficient
    if (remainingQty > 0) {
      return res.status(400).json({
        message: "Insufficient stock to fulfill required quantity",
      });
    }

    // ✅ SUCCESS
    res.json({ 
      batches: selectedBatches,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch batches" });
  } finally {
    conn.release();
  }
};
