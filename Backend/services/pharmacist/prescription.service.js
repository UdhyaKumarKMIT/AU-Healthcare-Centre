import pool from "../../config/db.js";
import { prescriptionPDF, generatePrescriptionPDF, sendEmailWithPDF } from "../../utils/pdf.js";

export const getAllPrescriptionsService = async () => {
  const [rows] = await pool.query(`
    SELECT DISTINCT pp.prescription_id, 
      p.name AS patient_name,
      d.name AS doctor_name,
      d.specialization AS doctor_specialization, 
      pp.created_at
    FROM prescription pp
    JOIN visit v ON pp.visit_id = v.visit_id
    JOIN patient p ON v.patient_id = p.patient_id
    JOIN doctor d ON pp.doctor_id = d.doctor_id 
    WHERE EXISTS (
        SELECT 1 FROM prescription_items pi
        WHERE pi.prescription_id = pp.prescription_id
          AND pi.is_external = 0
          AND pp.status = 'ACTIVE'
    )
    ORDER BY pp.created_at ASC
  `);
  return rows;
};

export const getPrescriptionDetailsService = async (id) => {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(`
      SELECT DISTINCT 
        pat.name AS patient_name,
        d.name AS doctor_name, 
        pi.duration_days AS total_days,  
        m.name AS medicine_name,
        m.type AS medicine_type,
        pi.dosage_per_day
      FROM prescription pp
      JOIN visit v ON v.visit_id = pp.visit_id
      JOIN patient pat ON pat.patient_id = v.patient_id
      JOIN doctor d ON d.doctor_id = pp.doctor_id
      JOIN prescription_items pi ON pi.prescription_id = pp.prescription_id
      JOIN medicine m ON m.medicine_id = pi.medicine_id
      WHERE pp.prescription_id = ? AND pi.is_external = 0;
    `, [id]);

    const [batches] = await conn.query(`
      SELECT m.name AS medicine_name, mb.batch_no AS batch_id
      FROM prescription_items pi
      JOIN medicine m ON m.medicine_id = pi.medicine_id
      JOIN pharmacy_stock mb ON mb.medicine_id = pi.medicine_id
      WHERE pi.prescription_id = ? AND mb.status = 'ACTIVE' AND mb.quantity > 0
      GROUP BY m.name, mb.batch_no
    `, [id]);

    const patientName = rows.length ? rows[0].patient_name : null;
    const doctorName = rows.length ? rows[0].doctor_name : null;

    const items = rows.map(row => ({
      medicine_name: row.medicine_name,
      medicine_type: row.medicine_type,
      total_days: row.total_days,
      dosage_per_day: row.dosage_per_day
    }));

    const batchIds = batches.map(row => ({
      medicine_name: row.medicine_name,
      batch_id: row.batch_id
    }));

    return { patient_name: patientName, doctor_name: doctorName, items, batchIds };
  } finally {
    conn.release();
  }
};

export const issueMedicineService = async ({ pharmacist_id, prescription_id, issued_days, batches }) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // --- Step 1: Validate and reduce stock for each batch ---
    for (const batch of batches) {
      const [rows] = await conn.query(
        `SELECT quantity AS in_stock FROM pharmacy_stock WHERE batch_no = ? FOR UPDATE`,
        [batch.batch_id]
      );

      if (!rows.length) throw new Error(`Batch ID ${batch.batch_id} not found`);

      const inStock = rows[0].in_stock;
      if (inStock < batch.quantity)
        throw new Error(`Insufficient stock for batch ${batch.batch_id}. Available: ${inStock}`);

      await conn.query(
        `UPDATE pharmacy_stock SET quantity = quantity - ? WHERE batch_no = ?`,
        [batch.quantity, batch.batch_id]
      );

      if (inStock === batch.quantity) {
        await conn.query(`DELETE FROM pharmacy_stock WHERE batch_no = ?`, [batch.batch_id]);
      }
    }

    // --- Step 2: Update prescription status ---
    await conn.query(`UPDATE prescription SET status = 'ISSUED' WHERE prescription_id = ?`, [prescription_id]);

    // --- Step 3: Validate pharmacist ---
    const [[staff]] = await conn.query(
      `SELECT code FROM staff_details WHERE staff_id = ? AND role = 'PHARMACIST'`,
      [pharmacist_id]
    );

    if (!staff) throw new Error("Invalid pharmacist_id");
    const pharmacist_code = staff.code;

    // --- Step 4: Insert transaction record ---
    const [result] = await conn.query(
      `INSERT INTO prescription_transaction (txn_id, prescription_id, issued_by_code, issued_at, issued_days)
       VALUES (UUID(), ?, ?, NOW(), ?)`,
      [prescription_id, pharmacist_code, issued_days]
    );

    if (result.affectedRows === 0) throw new Error("Unable to insert transaction record!");

    // --- Step 5: Generate PDF and send email if available ---
    const details = await prescriptionPDF(conn, prescription_id);
    const pdfPath = await generatePrescriptionPDF(details);

    if (details.email) {
      await sendEmailWithPDF(details.email, pdfPath);
    }

    await conn.commit();

    return { message: "Medicine issued successfully" };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};
