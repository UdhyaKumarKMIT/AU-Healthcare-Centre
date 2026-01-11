import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool from '../config/db.js';
import User from '../models/sequelize/User.js';
import Doctor from '../models/sequelize/Doctor.js';
import StaffDetails from '../models/sequelize/StaffDetails.js';
import ApiError from '../utils/ApiError.js';
import dotenv from 'dotenv';
import ROLES from '../constants/roles.js';
dotenv.config();

// Role-specific roles that use shared credentials
const ROLE_SPECIFIC_ROLES = ['NURSE_RECEPTIONIST', 'PHARMACIST'];

// User-specific roles that have individual credentials
const USER_SPECIFIC_ROLES = ['ADMIN', 'DOCTOR', 'LAB_TECHNICIAN', 'CLERICAL_ASSISTANT'];

export const login = async (username, password, role) => {
  // Validate role
  if (!role || !Object.values(ROLES).includes(role)) {
    throw new ApiError(400, 'Invalid role specified');
  }

  // Determine login type based on role
const isRoleSpecific = ROLE_SPECIFIC_ROLES.includes(role)
const isUserSpecific = USER_SPECIFIC_ROLES.includes(role) || role === ROLES.PATIENT

if (!isRoleSpecific && !isUserSpecific)
  throw new ApiError(400,'Invalid role')

const user = await User.findOne({
  where: isRoleSpecific
    ? { role, is_role_specific:true, status:'ACTIVE' }
    : { username, role, status:'ACTIVE', is_role_specific:false }
})

if (!user || (isRoleSpecific && user.username !== username))
  throw new ApiError(401,'Invalid credentials')


  // Verify password using bcrypt
  console.log('🔑 Verifying password...');
  console.log('Password hash from DB:', user.password_hash);
  console.log('Password provided:', password);
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  console.log('Password valid:', isPasswordValid);
  
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Generate JWT token
  const token = jwt.sign(
    { userId: user.user_id, role: user.role, isRoleSpecific: user.is_role_specific || false },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  )

  // Base response
  const response = {
    token,
    user: {
      id: user.user_id,
      username: user.username,
      role: user.role,
      isRoleSpecific: user.is_role_specific || false
    }
  }

  // If role-specific, fetch staff details from staff_details table
  if (isRoleSpecific) {

  const staffList = await StaffDetails.findAll({
    where: { role, status: 'ACTIVE' },
    attributes: ['staff_id', 'name', 'code', 'phone', 'email']
  });

  return {
    token: jwt.sign(
      { userId: user.user_id, role: user.role, isRoleSpecific: true },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    ),
    user: { id: user.user_id, username: user.username, role, isRoleSpecific: true },
    staffList
  };
}

  // If doctor, fetch doctor_id and profile using Sequelize
  if (user.role === ROLES.DOCTOR) {
    const doctor = await Doctor.findOne({
      where: { user_id: user.user_id },
      attributes: ['doctor_id', 'name', 'specialization', 'phone']
    });
    
    if (doctor) {
      response.user.doctor_id = doctor.doctor_id;
      response.user.name = doctor.name;
      response.user.specialization = doctor.specialization;
      response.user.phone = doctor.phone;
    }
  }

  // If lab technician, fetch lab_technician_id and profile from lab_technician table
  if (user.role === ROLES.LAB_TECHNICIAN) {
    const [labTechRows] = await pool.execute(
      'SELECT lab_technician_id, name, u.username as email, phone FROM lab_technician l JOIN users u ON l.user_id = u.user_id WHERE l.user_id = ?',
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

  // If admin, use username as name
  if (user.role === ROLES.ADMIN) {
    response.user.name = user.username;
  }

  console.log('✅ Login successful for:', username, '- Role:', user.role);
  if (user.role === ROLES.NURSE && !isRoleSpecific) {
    console.log('✅ Nurse profile loaded:', response.user.nurse_id, response.user.name);
  }

  return response
};