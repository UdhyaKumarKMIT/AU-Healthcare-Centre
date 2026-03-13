import pool from '../config/db.js'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import ApiError from '../utils/ApiError.js'

export const registerPatient = async ({
  email,
  password,
  roll_no,
  name,
  dob,
  gender,
  blood_group,
  phone,
  emergency_contact
}) => {
  // Check if email already exists
  const [existingUser] = await pool.execute(
    'SELECT user_id FROM users WHERE email = ?',
    [email]
  );

  if (existingUser.length > 0) {
    throw new ApiError(400, 'Email already registered');
  }

  // Check if roll_no already exists
  const [existingRollNo] = await pool.execute(
    'SELECT patient_id FROM patient_profile WHERE roll_no = ?',
    [roll_no]
  );

  if (existingRollNo.length > 0) {
    throw new ApiError(400, 'Roll number already registered');
  }

  const userId = crypto.randomUUID()
  const patientId = crypto.randomUUID()
  const hash = await bcrypt.hash(password, 10)

  // Insert into users table
  await pool.execute(
    `INSERT INTO users (user_id, email, password, role)
     VALUES (?,?,?,?)`,
    [userId, email, hash, 'PATIENT']
  )

  // Insert into patient_profile table WITHOUT email (email is only in users table)
  await pool.execute(
    `INSERT INTO patient_profile
     (patient_id, user_id, roll_no, name, dob, gender, blood_group, phone, emergency_contact)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [
      patientId,
      userId,
      roll_no,
      name,
      dob,
      gender,
      blood_group,
      phone,
      emergency_contact
    ]
  )
  
  console.log('✅ Patient registered:', { patientId, email, roll_no });
  
  return { patient_id: patientId }
}

export const createVisit = async ({
  patient_id,
  doctor_id,
  receptionist_id,
  visit_type,
  reason
}) => {
  const visit_id = crypto.randomUUID()

  await pool.execute(
    `INSERT INTO visit
     (visit_id, patient_id, doctor_id, receptionist_id, visit_date, visit_type, reason, status)
     VALUES (?, ?, ?, ?, NOW(), ?, ?, 'SCHEDULED')`,
    [visit_id, patient_id, doctor_id, receptionist_id, visit_type, reason]
  )

  return { visit_id }
}


export const addVitals = async ({
  visit_id,
  temperature,
  bp_systolic,
  bp_diastolic,
  heart_rate
}) => {
  await pool.execute(
    `INSERT INTO vitals
     (vitals_id, visit_id, temperature, bp_systolic, bp_diastolic, heart_rate)
     VALUES (UUID(), ?, ?, ?, ?, ?)`,
    [visit_id, temperature, bp_systolic, bp_diastolic, heart_rate]
  )
}

export const assignDoctorToVisit = async ({visit_id, doctor_id}) => {
  const [visitRows] = await pool.execute(
    `SELECT status FROM visit WHERE visit_id = ?`,
    [visit_id]
  )
  if (visitRows.length === 0) {
    throw new ApiError(404, 'Visit not found')
  }
  const visitStatus = visitRows[0].status
  if (visitStatus !== 'SCHEDULED') {
    throw new ApiError(
      400,
      'Doctor can only be assigned to a scheduled visit'
    )
  }
  const [doctorRows] = await pool.execute(
    `SELECT availability_status FROM doctor WHERE doctor_id = ?`,
    [doctor_id]
  )
  if (doctorRows.length === 0) {
    throw new ApiError(404, 'Doctor not found')
  }
  const doctorAvailability = doctorRows[0].availability_status
  if (doctorAvailability !== 'AVAILABLE') {
    throw new ApiError(400, 'Doctor is not available for assignment')
  }
  await pool.execute(
    `UPDATE visit SET doctor_id = ? WHERE visit_id = ?`,
    [doctor_id, visit_id]
  )
  return {visit_id, doctor_id}
}

export const getAllPatients = async () => {
  const [rows] = await pool.execute(
    `SELECT 
       patient_id, 
       name, 
       roll_no, 
       phone, 
       gender, 
       blood_group,
       dob,
       emergency_contact
     FROM patient_profile
     ORDER BY name ASC`
  )
  return rows
}

export const getAllDoctors = async () => {
  const [rows] = await pool.execute(
    `SELECT doctor_id, name, specialization, availability_status
     FROM doctor`
  )
  return rows
}

export const getAllAvailableDoctors = async () => {
  const [rows] = await pool.execute(
    `SELECT doctor_id, name, specialization, availability_status
     FROM doctor
     WHERE availability_status = 'AVAILABLE'`
  )
  return rows
}

export const getAllVisits = async () => {
  const [rows] = await pool.execute(
    `SELECT 
       v.visit_id, 
       v.patient_id, 
       v.doctor_id, 
       v.visit_type, 
       v.reason,
       v.status,
       v.visit_date,
       p.name as patient_name,
       d.name as doctor_name
     FROM visit v
     LEFT JOIN patient_profile p ON v.patient_id = p.patient_id
     LEFT JOIN doctor d ON v.doctor_id = d.doctor_id
     WHERE v.visit_date >= DATE_SUB(NOW(), INTERVAL 4 HOUR)
     ORDER BY v.visit_date DESC`
  )
  
  // Add sequential token numbers
  return rows.map((row, index) => ({
    ...row,
    token: String(index + 1).padStart(3, '0')
  }))
}

export const updateVisitStatus = async ({ visit_id, newStatus }) => {
  await pool.execute(
    `UPDATE visit SET status=? WHERE visit_id=?`,
    [newStatus, visit_id]
  )
}

export const updateDoctorAvailability = async (doctor_id, status) => {
  const allowed = ["AVAILABLE", "UNAVAILABLE"];

  if (!allowed.includes(status)) {
    throw new ApiError(400, "Invalid availability status");
  }

  const [result] = await pool.execute(
    `UPDATE doctor SET availability_status=? WHERE doctor_id=?`,
    [status, doctor_id]
  );

  if (result.affectedRows === 0) {
    throw new ApiError(404, "Doctor not found");
  }

  return { doctor_id, status };
};