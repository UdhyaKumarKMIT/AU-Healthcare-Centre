import pool from '../config/db.js'

export const findByEmail = async (email) => {
  const [r] = await pool.query('SELECT * FROM users WHERE email=?', [email])
  return r[0]
}

export const createUser = async ({ user_id, name, email, password, role }) =>
  pool.query(
    'INSERT INTO users (user_id,email,password,role) VALUES (?,?,?,?)',
    [user_id, email, password, role]
  )

export const createDoctor = async ({ doctor_id, user_id, name, specialization, phone }) =>
  pool.query(
    'INSERT INTO doctor (doctor_id,user_id,name,specialization,phone) VALUES (?,?,?,?,?)',
    [doctor_id, user_id, name, specialization, phone]
  )

export const createReceptionist = async ({ receptionist_id, user_id, receptionist_name }) =>
  pool.query(
    'INSERT INTO receptionist (receptionist_id,user_id,receptionist_name) VALUES (?,?,?)',
    [receptionist_id, user_id, receptionist_name]
  )
