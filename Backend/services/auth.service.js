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
  const isRoleSpecificLogin = ROLE_SPECIFIC_ROLES.includes(role);
  const isUserSpecificLogin = USER_SPECIFIC_ROLES.includes(role) || role === ROLES.PATIENT;

  let user;

  if (isRoleSpecificLogin) {
    // Role-specific login: Find shared account for this role using Sequelize
    console.log('🔍 Looking for role-specific account:', { role, username });
    user = await User.findOne({
      where: {
        role: role,
        is_role_specific: true,
        status: 'ACTIVE'
      }
    });

    console.log('📝 Found user:', user ? { username: user.username, role: user.role, is_role_specific: user.is_role_specific } : 'null');

    if (!user) {
      throw new ApiError(404, `No role-specific account found for ${role}`);
    }

    // Verify username matches the role-specific username
    console.log('🔐 Checking username match:', { provided: username, expected: user.username });
    if (user.username !== username) {
      throw new ApiError(401, 'Invalid credentials');
    }

  } else if (isUserSpecificLogin) {
    // User-specific login: Find user by username and role using Sequelize
    user = await User.findOne({
      where: {
        username: username,
        role: role,
        status: 'ACTIVE'
      }
    });

    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // Ensure it's not a role-specific account
    if (user.is_role_specific) {
      throw new ApiError(401, 'Invalid credentials');
    }
  } else {
    throw new ApiError(400, 'Invalid role configuration');
  }

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
  if (isRoleSpecificLogin) {
    const staffDetails = await StaffDetails.findOne({
      where: { user_id: user.user_id },
      attributes: ['staff_id', 'name', 'code', 'phone', 'email']
    });
    
    if (staffDetails) {
      response.user.staff_id = staffDetails.staff_id;
      response.user.name = staffDetails.name;
      response.user.code = staffDetails.code;
      response.user.phone = staffDetails.phone;
      response.user.email = staffDetails.email;
      
      // For backward compatibility
      response.user.nurse_id = staffDetails.staff_id;
      response.user.pharmacist_id = staffDetails.staff_id;
    }
    
    console.log('✅ Role-specific login successful for:', role);
    return response;
  }

  // For user-specific accounts, fetch role-specific profile data

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

  // If receptionist (user-specific), fetch receptionist_id from receptionist table
  if (user.role === ROLES.RECEPTIONIST && !isRoleSpecificLogin) {
    const [receptionistRows] = await pool.execute(
      'SELECT receptionist_id FROM receptionist WHERE user_id = ?',
      [user.user_id]
    )
    
    if (receptionistRows.length > 0) {
      response.user.receptionist_id = receptionistRows[0].receptionist_id
    }
  }

  // If nurse (user-specific), fetch nurse_id and name from nurse table
  if (user.role === ROLES.NURSE && !isRoleSpecificLogin) {
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

  // If pharmacist (user-specific), fetch pharmacist_id and profile from pharmacist table
  if (user.role === ROLES.PHARMACIST && !isRoleSpecificLogin) {
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
  if (user.role === ROLES.NURSE && !isRoleSpecificLogin) {
    console.log('✅ Nurse profile loaded:', response.user.nurse_id, response.user.name);
  }

  return response
};