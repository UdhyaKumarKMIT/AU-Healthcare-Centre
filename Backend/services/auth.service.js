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

  return response
};