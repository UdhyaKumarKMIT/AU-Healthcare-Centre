import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import dotenv from 'dotenv';
dotenv.config();

export const login = async (email, password) => {
  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
  if (rows.length === 0) {
    throw new ApiError(404, 'User not found');
  }
  const user = rows[0];
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if(!isPasswordValid) {
    throw new ApiError(401, 'Invalid Credentials');
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};