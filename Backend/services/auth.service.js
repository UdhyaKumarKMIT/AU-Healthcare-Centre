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

  // If pharmacist, fetch pharmacist_id and profile from pharmacist table
  if (user.role === ROLES.PHARMACIST) {
    const [pharmacistRows] = await pool.execute(
      'SELECT pharmacist_id, name, email, phone FROM pharmacist WHERE user_id = ?',
      [user.user_id]
    )
    
    if (pharmacistRows.length > 0) {
      response.user.pharmacist_id = pharmacistRows[0].pharmacist_id
      response.user.name = pharmacistRows[0].name
      response.user.pharmacist_email = pharmacistRows[0].email
      response.user.phone = pharmacistRows[0].phone
    } else {
      console.warn('⚠️ Pharmacist user found but no pharmacist profile exists for user_id:', user.user_id)
    }
  }

  // If lab technician, fetch lab_technician_id and profile from lab_technician table
  if (user.role === ROLES.LAB_TECHNICIAN) {
    const [labTechRows] = await pool.execute(
      'SELECT lab_technician_id, name, u.email phone FROM lab_technician l JOIN users u ON l.user_id = u.user_id WHERE l.user_id = ?',
      [user.user_id]
    )

    if (labTechRows.length > 0) {
      response.user.lab_technician_id = labTechRows[0].lab_technician_id
      response.user.name = labTechRows[0].name
      response.user.email = labTechRows[0].email
      response.user.phone = labTechRows[0].phone
    } else {
      console.warn('⚠️ Lab Technician user found but no profile exists for user_id:', user.user_id)
    }
  }

  console.log('✅ Login successful for:', email, '- Role:', user.role);
  if (user.role === ROLES.NURSE) {
    console.log('✅ Nurse profile loaded:', response.user.nurse_id, response.user.name);
  }

  return response
};