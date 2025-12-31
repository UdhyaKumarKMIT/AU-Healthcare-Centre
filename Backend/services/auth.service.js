import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import dotenv from 'dotenv';
import ROLES from '../constants/roles.js';
dotenv.config();

export const login = async (email, password) => {
  const [rows] = await pool.execute(
    'SELECT user_id, email, password, role FROM users WHERE email = ?',
    [email]
  )

  if (!rows.length) {
    throw new ApiError(404, 'User not found')
  }

  const user = rows[0]

  const isPasswordValid = await bcrypt.compare(password, user.password)
  console.log(password, user.password)
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid Credentials')
  }

  const token = jwt.sign(
    { userId: user.user_id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  )

  // Base response
  const response = {
    token,
    user: {
      id: user.user_id,
      email: user.email,
      role: user.role
    }
  }

  // If receptionist, fetch receptionist_id from receptionist table
  if (user.role === ROLES.RECEPTIONIST) {
    const [receptionistRows] = await pool.execute(
      'SELECT receptionist_id FROM receptionist WHERE user_id = ?',
      [user.user_id]
    )
    
    if (receptionistRows.length > 0) {
      response.user.receptionist_id = receptionistRows[0].receptionist_id
    }
  }

  // If doctor, fetch doctor_id from doctor table
  if (user.role === ROLES.DOCTOR) {
    const [doctorRows] = await pool.execute(
      'SELECT doctor_id FROM doctor WHERE user_id = ?',
      [user.user_id]
    )
    
    if (doctorRows.length > 0) {
      response.user.doctor_id = doctorRows[0].doctor_id
    }
  }

  // If nurse, fetch nurse_id and name from nurse table
  if (user.role === ROLES.NURSE) {
    const [nurseRows] = await pool.execute(
      'SELECT nurse_id, name, register_number, qualification, phone FROM nurse WHERE user_id = ?',
      [user.user_id]
    )
    
    if (nurseRows.length > 0) {
      response.user.nurse_id = nurseRows[0].nurse_id
      response.user.name = nurseRows[0].name
      response.user.register_number = nurseRows[0].register_number
      response.user.qualification = nurseRows[0].qualification
      response.user.phone = nurseRows[0].phone
    } else {
      console.warn('⚠️ Nurse user found but no nurse profile exists for user_id:', user.user_id)
    }
  }

  // If pharmacist, fetch pharmacist_id from pharmacist table (optional - add if you have this)
  if (user.role === ROLES.PHARMACIST) {
    const [pharmacistRows] = await pool.execute(
      'SELECT pharmacist_id FROM pharmacist WHERE user_id = ?',
      [user.user_id]
    )
    
    if (pharmacistRows.length > 0) {
      response.user.pharmacist_id = pharmacistRows[0].pharmacist_id
    }
  }

  console.log('✅ Login successful for:', email, '- Role:', user.role);
  if (user.role === ROLES.NURSE) {
    console.log('✅ Nurse profile loaded:', response.user.nurse_id, response.user.name);
  }

  return response
};