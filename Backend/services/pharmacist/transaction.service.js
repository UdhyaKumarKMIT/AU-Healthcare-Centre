import sequelize from "../../config/sequelize.js";
import { QueryTypes } from "sequelize";

/* ============================
   Get all transactions
============================ */
export const getTransactionsService = async () => {
  const rows = await sequelize.query(
    `
    SELECT
      pt.prescription_id, 
      pt.issued_days,
      pt.issued_at,
      ph.name AS pharmacist_name,
      d.name AS doctor_name,
      d.specialization AS doctor_specialization,
      p.name AS patient_name
    FROM prescription_transaction pt
    JOIN staff_details ph ON pt.issued_by_code = ph.code
    JOIN prescription pp ON pt.prescription_id = pp.prescription_id
    JOIN doctor d ON pp.doctor_id = d.doctor_id
    JOIN visit v ON pp.visit_id = v.visit_id
    JOIN patient p ON v.patient_id = p.patient_id
    ORDER BY pt.issued_at ASC;
    `,
    { type: QueryTypes.SELECT }
  );

  return rows.map(row => ({
    patient_name: row.patient_name,
    doctor_name: row.doctor_name,
    name: row.pharmacist_name,
    issued_at: row.issued_at,
    prescription_id: row.prescription_id,
    issued_days: row.issued_days,
    specialization: row.doctor_specialization
  }));
};

/* ============================
   Get transaction details
============================ */
export const getTransactionDetailsService = async (id) => {
  const rows = await sequelize.query(
    `
    SELECT
      m.name AS medicine_name, 
      m.type AS medicine_type,
      ppi.duration_days AS total_days, 
      ppi.dosage_per_day,
      pt.issued_days,
      ppi.food_timing,
      JSON_ARRAY(ppi.morning, ppi.afternoon, ppi.night) AS timing_flags
    FROM prescription_items ppi
    JOIN medicine m ON m.medicine_id = ppi.medicine_id
    JOIN prescription_transaction pt
      ON pt.prescription_id = ppi.prescription_id
    WHERE ppi.prescription_id = ?;
    `,
    {
      replacements: [id],
      type: QueryTypes.SELECT
    }
  );

  return rows.map(row => ({
    medicine_name: row.medicine_name,
    medicine_type: row.medicine_type,
    total_days: row.total_days,
    dosage_per_day: row.dosage_per_day,
    issued_days: row.issued_days,
    food_timing: row.food_timing,
    timing_flags: row.timing_flags // [morning, afternoon, night]
  }));
};

/* ============================
   Get pending pharmacy stock verifications
============================ */
export const getPendingPharmacyStockService = async () => {
  const rows = await sequelize.query(
    `
    SELECT 
      ps.medicine_id,
      ps.batch_no,
      ps.quantity,
      ps.expiry,
      m.name AS medicine_name
    FROM pharmacy_stock ps
    JOIN medicine m ON ps.medicine_id = m.medicine_id
    WHERE ps.verification = 'waiting'
    ORDER BY m.name ASC, ps.expiry ASC
    `,
    { type: QueryTypes.SELECT }
  );

  const grouped = {};

  for (const row of rows) {
    if (!grouped[row.medicine_id]) {
      grouped[row.medicine_id] = {
        medicine_id: row.medicine_id,
        medicine_name: row.medicine_name,
        batches: []
      };
    }

    grouped[row.medicine_id].batches.push({
      batch_no: row.batch_no,
      quantity: row.quantity,
      expiry: row.expiry
    });
  }

  return Object.values(grouped);
};


export const verifyPharmacyStockService = async (batch_no, secret_code) => {
  if (!batch_no) {
    throw new Error("Batch number is required");
  }

  if (!secret_code) {
    throw new Error("Secret code is required");
  }

  // Validate secret code exists as an active PHARMACIST staff
  const staffRows = await sequelize.query(
    `
    SELECT staff_id
    FROM staff_details
    WHERE code = ?
      AND role = 'PHARMACIST'
      AND status = 'ACTIVE'
    `,
    {
      replacements: [secret_code],
      type: QueryTypes.SELECT
    }
  );

  if (!staffRows.length) {
    throw new Error("Invalid secret code");
  }

  const [affectedRows] = await sequelize.query(
    `
    UPDATE pharmacy_stock
    SET verification = 'done'
    WHERE batch_no = ?
      AND verification = 'waiting'
    `,
    {
      replacements: [batch_no],
      type: QueryTypes.UPDATE,
    }
  );

  return affectedRows > 0 || true;
};