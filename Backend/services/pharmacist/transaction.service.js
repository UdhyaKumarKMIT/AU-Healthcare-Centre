import pool from "../../config/db.js";

export const getTransactionsService = async () => {
  const [rows] = await pool.query(`
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
  `);

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

export const getTransactionDetailsService = async (id) => {
  const [rows] = await pool.query(`
    SELECT
      m.name AS medicine_name, 
      m.type AS medicine_type,
      ppi.duration_days AS total_days, 
      ppi.dosage_per_day,
      pt.issued_days
    FROM prescription_items ppi
    JOIN medicine m ON m.medicine_id = ppi.medicine_id
    JOIN prescription_transaction pt ON pt.prescription_id = ppi.prescription_id
    WHERE ppi.prescription_id = ?;
  `, [id]);

  return rows.map(row => ({
    medicine_name: row.medicine_name,
    medicine_type: row.medicine_type,
    total_days: row.total_days,
    dosage_per_day: row.dosage_per_day,
    issued_days: row.issued_days
  }));
};
