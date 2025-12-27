import pool from '../config/db.js';
import crypto from 'crypto';

export const VISIT_STATUS = {
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW'
};

export const updateVisitStatus = async ({ visit_id, newStatus }) => {
  const validStatuses = Object.values(VISIT_STATUS);
  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const [result] = await pool.execute(
    `UPDATE visit SET status=? WHERE visit_id=?`,
    [newStatus, visit_id]
  );

  if (result.affectedRows === 0) {
    throw new Error('Visit not found');
  }

  return { success: true, visit_id, newStatus };
};

export const addDiagnosis = async ({ visit_id, doctor_id, diagnosis_code, diagnosis_name, diagnosis_notes }) => {
  await pool.execute(
    `INSERT INTO diagnosis
     (diagnosis_id, visit_id, doctor_id, diagnosis_code, diagnosis_name, diagnosis_notes)
     VALUES (?,?,?,?,?,?)`,
    [crypto.randomUUID(), visit_id, doctor_id, diagnosis_code, diagnosis_name, diagnosis_notes]
  );
};

export const createPrescription = async ({ visit_id, doctor_id, meds }) => {
  const conn = await pool.getConnection();
  console.log("💊 inserting prescription items:", meds.length);

  try {
    await conn.beginTransaction();

    const prescriptionId = crypto.randomUUID();

    await conn.execute(
      `INSERT INTO prescription 
        (prescription_id, visit_id, doctor_id, status)
       VALUES (?, ?, ?, 'PENDING')`,
      [prescriptionId, visit_id, doctor_id]
    );

    for (const med of meds) {
      await conn.execute(
        `INSERT INTO prescription_items 
          (item_id, prescription_id, med_name, med_type, total_days, food, morning, afternoon, night)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          prescriptionId,
          med.name,
          med.type || null,
          med.days,
          med.food,
          med.morning,
          med.afternoon,
          med.night
        ]
      );
    }

    await conn.commit();
    return { prescription_id: prescriptionId };

  } catch (err) {
    console.error("❌ Prescription insert failed:", err);
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

export const getVisitsByDoctorId = async (doctor_id) => {
  const [rows] = await pool.execute(
    `SELECT 
      v.visit_id,
      v.patient_id,
      v.doctor_id,
      v.receptionist_id,
      v.visit_date,
      v.visit_type,
      v.reason,
      v.status,
      p.name as patient_name,
      p.roll_no as patient_roll_no,
      p.phone as patient_phone,
      d.name as doctor_name
     FROM visit v
     LEFT JOIN patient_profile p ON v.patient_id = p.patient_id
     LEFT JOIN doctor d ON v.doctor_id = d.doctor_id
     WHERE v.doctor_id = ?
     ORDER BY v.visit_date DESC`,
    [doctor_id]
  );
  return rows;
};

export const getActiveDoctorVisits = async (doctor_id) => {
  const [rows] = await pool.execute(
    `SELECT 
      v.visit_id,
      v.patient_id,
      v.doctor_id,
      v.receptionist_id,
      v.visit_date,
      v.visit_type,
      v.reason,
      v.status,
      p.name as patient_name,
      p.roll_no as patient_roll_no,
      p.phone as patient_phone,
      p.dob as patient_dob,
      p.gender as patient_gender,
      p.blood_group as patient_blood_group,
      d.name as doctor_name,
      d.specialization as doctor_specialization
     FROM visit v
     LEFT JOIN patient_profile p ON v.patient_id = p.patient_id
     LEFT JOIN doctor d ON v.doctor_id = d.doctor_id
     WHERE v.doctor_id = ? 
     AND v.status IN ('SCHEDULED', 'IN_PROGRESS')
     ORDER BY v.visit_date DESC`,
    [doctor_id]
  );
  return rows;
};
