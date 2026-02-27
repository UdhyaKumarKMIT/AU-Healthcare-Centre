import sequelize from "../../config/sequelize.js";
import { QueryTypes } from "sequelize";
import {
  prescriptionPDF,
  generatePrescriptionPDFStream,
  sendPrescriptionEmail
} from "../../utils/pdf.js";

/* ============================
   Get all prescriptions
============================ */
export const getAllPrescriptionsService = async () => {
  const rows = await sequelize.query(
    `
    SELECT DISTINCT
      pp.prescription_id, 
      p.name AS patient_name,
      d.name AS doctor_name,
      d.specialization AS doctor_specialization, 
      pp.created_at
    FROM prescription pp
    JOIN visit v ON pp.visit_id = v.visit_id
    JOIN patient p ON v.patient_id = p.patient_id
    JOIN doctor d ON pp.doctor_id = d.doctor_id 
    WHERE EXISTS (
      SELECT 1
      FROM prescription_items pi
      WHERE pi.prescription_id = pp.prescription_id
        AND pi.is_external = 0
        AND pp.status = 'ACTIVE'
    )
    ORDER BY pp.created_at ASC
    `,
    { type: QueryTypes.SELECT }
  );

  return rows;
};

/* ============================
   Get prescription details
============================ */
export const getPrescriptionDetailsService = async (id) => {
  const transaction = await sequelize.transaction();

  try {
    const rows = await sequelize.query(
      `
      SELECT DISTINCT 
        pat.name AS patient_name,
        d.name AS doctor_name, 
        pi.duration_days AS total_days,  
        m.name AS medicine_name,
        m.type AS medicine_type,
        pi.food_timing,
        JSON_ARRAY(pi.morning, pi.afternoon, pi.night) AS timing_flags,
        pi.dosage_per_day
      FROM prescription pp
      JOIN visit v ON v.visit_id = pp.visit_id
      JOIN patient pat ON pat.patient_id = v.patient_id
      JOIN doctor d ON d.doctor_id = pp.doctor_id
      JOIN prescription_items pi ON pi.prescription_id = pp.prescription_id
      JOIN medicine m ON m.medicine_id = pi.medicine_id
      WHERE pp.prescription_id = ?
        AND pi.is_external = 0
      `,
      {
        replacements: [id],
        type: QueryTypes.SELECT,
        transaction
      }
    );

    const batches = await sequelize.query(
      `
      SELECT
        m.name AS medicine_name,
        mb.batch_no AS batch_id
      FROM prescription_items pi
      JOIN medicine m ON m.medicine_id = pi.medicine_id
      JOIN pharmacy_stock mb ON mb.medicine_id = pi.medicine_id
      WHERE pi.prescription_id = ?
        AND mb.status = 'ACTIVE'
        AND mb.quantity > 0
      GROUP BY m.name, mb.batch_no
      `,
      {
        replacements: [id],
        type: QueryTypes.SELECT,
        transaction
      }
    );

    const patientName = rows.length ? rows[0].patient_name : null;
    const doctorName = rows.length ? rows[0].doctor_name : null;
    const timingFlags = rows[0]?.timing_flags || [0, 0, 0];

    const items = rows.map(row => ({
      medicine_name: row.medicine_name,
      medicine_type: row.medicine_type,
      total_days: row.total_days,
      dosage_per_day: row.dosage_per_day,
      timing_flags: timingFlags,
      food_timing: row.food_timing,
    }));

    const batchIds = batches.map(row => ({
      medicine_name: row.medicine_name,
      batch_id: row.batch_id
    }));

    await transaction.commit();

    return {
      patient_name: patientName,
      doctor_name: doctorName,
      items,
      batchIds
    };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

/* ============================
   Issue medicine
============================ */
export const issueMedicineService = async ({
  secret_code,
  prescription_id,
  issued_days,
  batches
}) => {
  const transaction = await sequelize.transaction();

  try {
    // --- Step 1: Validate and reduce stock ---
    for (const batch of batches) {
      const rows = await sequelize.query(
        `
        SELECT quantity AS in_stock
        FROM pharmacy_stock
        WHERE batch_no = ?
        FOR UPDATE
        `,
        {
          replacements: [batch.batch_id],
          type: QueryTypes.SELECT,
          transaction
        }
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

      await sequelize.query(
        `
        UPDATE pharmacy_stock
        SET quantity = quantity - ?
        WHERE batch_no = ?
        `,
        {
          replacements: [batch.quantity, batch.batch_id],
          transaction
        }
      );

      if (inStock === batch.quantity) {
        await sequelize.query(
          `DELETE FROM pharmacy_stock WHERE batch_no = ?`,
          {
            replacements: [batch.batch_id],
            transaction
          }
        );
      }
    }

    // --- Step 2: Update prescription status ---
    await sequelize.query(
      `UPDATE prescription SET status = 'ISSUED' WHERE prescription_id = ?`,
      {
        replacements: [prescription_id],
        transaction
      }
    );

    // --- Step 3: Validate pharmacist secret code ---
    const staffRows = await sequelize.query(
      `
      SELECT code
      FROM staff_details
      WHERE code = ?
        AND role = 'PHARMACIST'
        AND status = 'ACTIVE'
      `,
      {
        replacements: [secret_code],
        type: QueryTypes.SELECT,
        transaction
      }
    );

    if (!staffRows.length) {
      throw new Error("Invalid secret code");
    }

    const pharmacist_code = staffRows[0].code;

    // --- Step 4: Insert transaction record ---
    const [result] = await sequelize.query(
      `
      INSERT INTO prescription_transaction
        (txn_id, prescription_id, issued_by_code, issued_at, issued_days)
      VALUES
        (UUID(), ?, ?, NOW(), ?)
      `,
      {
        replacements: [
          prescription_id,
          pharmacist_code,
          issued_days
        ],
        transaction
      }
    );

    if (result.affectedRows === 0) {
      throw new Error("Unable to insert transaction record!");
    }

    // --- Step 5: Generate PDF (inside txn for consistent reads) ---
    const details = await prescriptionPDF(transaction, prescription_id);
    const pdfStream = await generatePrescriptionPDFStream(details);

    // Commit first so email connectivity doesn't block issuing.
    await transaction.commit();

    // --- Step 6: Email (best-effort) ---
    let emailResult = null;
    let emailError = null;
    if (details.email) {
      try {
        emailResult = await sendPrescriptionEmail(details.email, pdfStream);
      } catch (e) {
        emailError = e?.message ? String(e.message) : String(e);
        console.warn("Issue medicine: email send failed (continuing):", emailError);
      }
    }

    return {
      message: "Medicine issued successfully",
      email: {
        attempted: !!details.email,
        sent: !!emailResult,
        messageId: emailResult,
        error: emailError,
      },
    };
  } catch (err) {
    console.log(err)
    await transaction.rollback();
    throw err;
  }
};
