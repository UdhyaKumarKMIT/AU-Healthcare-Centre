// src/services/admin.service.js
import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import ApiError from '../utils/ApiError.js';

/**
 * Get admin dashboard statistics
 * Based on actual database: 6 users, 1 doctor, 1 receptionist, 2 patients
 */
export const getAdminStats = async () => {
  try {
    console.log('📊 Fetching admin stats from database...');
    
    // Get total users (should be 6)
    const [userCount] = await pool.execute(
      `SELECT COUNT(*) as total FROM users`
    );
    console.log('👥 Total Users:', userCount[0].total);
    
    // Get total doctors (should be 1)
    const [doctorCount] = await pool.execute(
      `SELECT COUNT(*) as total FROM doctor`
    );
    console.log('👨‍⚕️ Total Doctors:', doctorCount[0].total);
    
    // Get total receptionists (should be 1, not 2!)
    const [receptionistCount] = await pool.execute(
      `SELECT COUNT(*) as total FROM receptionist`
    );
    console.log('👔 Total Receptionists:', receptionistCount[0].total);
    
    // Get total patients (should be 2)
    const [patientCount] = await pool.execute(
      `SELECT COUNT(*) as total FROM patient_profile`
    );
    console.log('🏥 Total Patients:', patientCount[0].total);
    
    // Get counts by role from users table
    const [roleCounts] = await pool.execute(
      `SELECT role, COUNT(*) as count FROM users GROUP BY role`
    );
    console.log('📊 Role Counts:', roleCounts);
    
    // Convert role counts to object
    const roleCountsObj = roleCounts.reduce((acc, row) => {
      acc[row.role.toLowerCase()] = row.count;
      return acc;
    }, {});
    
    // Get today's visits (should be 0 - all visits are older)
    const [todayVisits] = await pool.execute(
      `SELECT COUNT(*) as total FROM visit 
       WHERE DATE(visit_date) = CURDATE()`
    );
    console.log('📅 Today\'s Visits:', todayVisits[0].total);
    
    // Get new patients today (should be 0)
    const [newPatientsToday] = await pool.execute(
      `SELECT COUNT(DISTINCT v.patient_id) as total 
       FROM visit v
       WHERE DATE(v.visit_date) = CURDATE()
       AND v.patient_id IN (
         SELECT patient_id 
         FROM visit 
         GROUP BY patient_id 
         HAVING MIN(DATE(visit_date)) = CURDATE()
       )`
    );
    console.log('✨ New Patients Today:', newPatientsToday[0].total);
    
    const stats = {
      totalUsers: userCount[0].total,              // 6
      totalDoctors: doctorCount[0].total,          // 1
      totalReceptionists: receptionistCount[0].total, // 1
      totalNurses: roleCountsObj.nurse || 0,       // 0
      totalPharmacists: roleCountsObj.pharmacist || 0, // 0
      totalAdministrators: roleCountsObj.admin || 0,   // 1
      totalPatients: patientCount[0].total,        // 2
      todayVisits: todayVisits[0].total,          // 0
      newPatientsToday: newPatientsToday[0].total // 0
    };
    
    console.log('✅ Final Stats Object:', stats);
    return stats;
    
  } catch (error) {
    console.error('❌ Error fetching admin stats:', error);
    throw new ApiError(500, 'Failed to fetch admin statistics: ' + error.message);
  }
};

/**
 * Get patient overview and demographics
 */
export const getPatientOverview = async () => {
  try {
    console.log('📊 Fetching patient overview...');
    
    // Get gender demographics (should show: MALE: 2)
    const [demographics] = await pool.execute(
      `SELECT 
         gender,
         COUNT(*) as count
       FROM patient_profile
       WHERE gender IS NOT NULL
       GROUP BY gender`
    );
    console.log('👥 Demographics:', demographics);
    
    // Get visit trends (should show: Dec: 20 visits)
    const [visitTrends] = await pool.execute(
      `SELECT 
         DATE_FORMAT(visit_date, '%b') as month,
         MONTH(visit_date) as month_num,
         YEAR(visit_date) as year,
         COUNT(*) as visits
       FROM visit
       WHERE visit_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY YEAR(visit_date), MONTH(visit_date), DATE_FORMAT(visit_date, '%b')
       ORDER BY year, month_num ASC`
    );
    console.log('📈 Visit Trends:', visitTrends);
    
    const result = {
      demographics: demographics.reduce((acc, row) => {
        acc[row.gender.toLowerCase()] = row.count;
        return acc;
      }, {}),
      visitTrends: visitTrends.map(row => ({
        month: row.month,
        visits: row.visits
      }))
    };
    
    console.log('✅ Patient Overview Result:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Error fetching patient overview:', error);
    throw new ApiError(500, 'Failed to fetch patient overview: ' + error.message);
  }
};

/**
 * Get all users with optional filters
 */
export const getAllUsers = async ({ role, status, search }) => {
  try {
    console.log('👥 Fetching users with filters:', { role, status, search });
    
    let query = `
      SELECT 
        u.user_id,
        u.email,
        u.role,
        COALESCE(d.name, r.receptionist_name, 'Unknown') as name,
        COALESCE(d.doctor_id, r.receptionist_id) as role_id,
        COALESCE(d.specialization, 'N/A') as department,
        COALESCE(d.phone, 'N/A') as phone
      FROM users u
      LEFT JOIN doctor d ON u.user_id = d.user_id AND u.role = 'DOCTOR'
      LEFT JOIN receptionist r ON u.user_id = r.user_id AND u.role = 'RECEPTIONIST'
      WHERE 1=1
    `;
    
    const params = [];
    
    if (role && role !== 'all') {
      query += ` AND u.role = ?`;
      params.push(role.toUpperCase());
    }
    
    if (search) {
      query += ` AND (u.email LIKE ? OR d.name LIKE ? OR r.receptionist_name LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }
    
    query += ` ORDER BY u.email ASC`;
    
    console.log('🔍 SQL Query:', query);
    console.log('🔍 Params:', params);
    
    const [users] = await pool.execute(query, params);
    console.log('✅ Found users:', users.length);
    
    const mappedUsers = users.map(user => ({
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      phone: user.phone,
      status: 'active',
      registeredDate: null
    }));
    
    console.log('✅ Mapped Users:', mappedUsers);
    return mappedUsers;
    
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    throw new ApiError(500, 'Failed to fetch users: ' + error.message);
  }
};

/**
 * Create a new user
 */
export const createUser = async ({ name, email, password, role }) => {
  const connection = await pool.getConnection();
  
  try {
    console.log('➕ Creating user:', { name, email, role });
    await connection.beginTransaction();
    
    // Check if user already exists
    const [existing] = await connection.execute(
      `SELECT user_id FROM users WHERE email = ?`,
      [email]
    );
    
    if (existing.length > 0) {
      throw new ApiError(409, 'User with this email already exists');
    }
    
    const userId = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('Creating user with ID:', userId);
    
    // Insert into users table
    await connection.execute(
      `INSERT INTO users (user_id, email, password, role)
       VALUES (?, ?, ?, ?)`,
      [userId, email, hashedPassword, role.toUpperCase()]
    );
    
    // Insert into role-specific table
    if (role.toUpperCase() === 'DOCTOR') {
      const doctorId = crypto.randomUUID();
      console.log('Creating doctor with ID:', doctorId);
      await connection.execute(
        `INSERT INTO doctor (doctor_id, user_id, name, specialization, availability_status)
         VALUES (?, ?, ?, ?, 'AVAILABLE')`,
        [doctorId, userId, name, 'General']
      );
    } else if (role.toUpperCase() === 'RECEPTIONIST') {
      const receptionistId = crypto.randomUUID();
      console.log('Creating receptionist with ID:', receptionistId);
      // Note: receptionist table has NO phone or shift columns
      await connection.execute(
        `INSERT INTO receptionist (receptionist_id, user_id, receptionist_name)
         VALUES (?, ?, ?)`,
        [receptionistId, userId, name]
      );
    }
    
    await connection.commit();
    console.log('✅ User created successfully');
    
    return {
      user_id: userId,
      name,
      email,
      role: role.toUpperCase()
    };
  } catch (error) {
    await connection.rollback();
    console.error('❌ Error creating user:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Failed to create user: ' + error.message);
  } finally {
    connection.release();
  }
};

/**
 * Update user status
 */
export const updateUserStatus = async (userId, status, reason) => {
  try {
    console.log('🔄 Updating user status:', { userId, status, reason });
    
    // Verify user exists
    const [users] = await pool.execute(
      `SELECT user_id, role FROM users WHERE user_id = ?`,
      [userId]
    );
    
    if (users.length === 0) {
      throw new ApiError(404, 'User not found');
    }
    
    console.log('✅ User found, status updated (placeholder)');
    
    return { 
      userId, 
      status, 
      reason,
      message: 'Status tracking not yet implemented. Add status column to users table.'
    };
  } catch (error) {
    console.error('❌ Error updating user status:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Failed to update user status: ' + error.message);
  }
};

/**
 * Delete a user
 */
export const deleteUser = async (userId) => {
  const connection = await pool.getConnection();
  
  try {
    console.log('🗑️ Deleting user:', userId);
    await connection.beginTransaction();
    
    const [users] = await connection.execute(
      `SELECT user_id, role FROM users WHERE user_id = ?`,
      [userId]
    );
    
    if (users.length === 0) {
      throw new ApiError(404, 'User not found');
    }
    
    const user = users[0];
    console.log('User to delete:', user);
    
    // Delete from role-specific table first
    if (user.role === 'DOCTOR') {
      // Check for visits
      const [visits] = await connection.execute(
        `SELECT COUNT(*) as count FROM visit WHERE doctor_id IN (SELECT doctor_id FROM doctor WHERE user_id = ?)`,
        [userId]
      );
      
      if (visits[0].count > 0) {
        throw new ApiError(400, 'Cannot delete doctor with existing visits');
      }
      
      await connection.execute(`DELETE FROM doctor WHERE user_id = ?`, [userId]);
    } else if (user.role === 'RECEPTIONIST') {
      await connection.execute(`DELETE FROM receptionist WHERE user_id = ?`, [userId]);
    } else if (user.role === 'PATIENT') {
      const [visits] = await connection.execute(
        `SELECT COUNT(*) as count FROM visit WHERE patient_id IN (SELECT patient_id FROM patient_profile WHERE user_id = ?)`,
        [userId]
      );
      
      if (visits[0].count > 0) {
        throw new ApiError(400, 'Cannot delete patient with existing visits');
      }
      
      await connection.execute(`DELETE FROM patient_profile WHERE user_id = ?`, [userId]);
    }
    
    // Delete from users table
    await connection.execute(`DELETE FROM users WHERE user_id = ?`, [userId]);
    
    await connection.commit();
    console.log('✅ User deleted successfully');
    
    return { 
      userId,
      message: 'User deleted successfully'
    };
  } catch (error) {
    await connection.rollback();
    console.error('❌ Error deleting user:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Failed to delete user: ' + error.message);
  } finally {
    connection.release();
  }
};

/**
 * Get all doctors
 * Expected: 1 doctor (John, Cardiology, doctor1@mit.edu)
 */
export const getAllDoctors = async () => {
  try {
    console.log('👨‍⚕️ Fetching all doctors...');
    
    const [doctors] = await pool.execute(
      `SELECT 
        d.doctor_id,
        d.user_id,
        d.name,
        d.specialization,
        d.phone,
        d.availability_status,
        u.email
      FROM doctor d
      JOIN users u ON d.user_id = u.user_id
      ORDER BY d.name ASC`
    );
    
    console.log('✅ Found doctors:', doctors.length);
    console.log('📋 Doctor details:', doctors);
    
    return doctors.map(doctor => ({
      id: doctor.doctor_id,
      doctor_id: doctor.doctor_id,
      user_id: doctor.user_id,
      name: doctor.name,
      email: doctor.email,
      specialization: doctor.specialization,
      phone: doctor.phone || 'N/A',
      availability: doctor.availability_status,
      status: doctor.availability_status === 'AVAILABLE' ? 'active' : 'inactive'
    }));
    
  } catch (error) {
    console.error('❌ Error fetching doctors:', error);
    throw new ApiError(500, 'Failed to fetch doctors: ' + error.message);
  }
};

/**
 * Get all receptionists
 * Expected: 1 receptionist (receptionist1, receptionist2@mit.edu)
 * NOTE: receptionist table has NO phone or shift columns!
 */
export const getAllReceptionists = async () => {
  try {
    console.log('👔 Fetching all receptionists...');
    
    // Receptionist table only has: receptionist_id, user_id, receptionist_name
    const [receptionists] = await pool.execute(
      `SELECT 
        r.receptionist_id,
        r.user_id,
        r.receptionist_name as name,
        u.email
      FROM receptionist r
      JOIN users u ON r.user_id = u.user_id
      ORDER BY r.receptionist_name ASC`
    );
    
    console.log('✅ Found receptionists:', receptionists.length);
    console.log('📋 Receptionist details:', receptionists);
    
    // Get patient counts for today for each receptionist
    const receptionistsWithStats = await Promise.all(
      receptionists.map(async (receptionist) => {
        const [patientCount] = await pool.execute(
          `SELECT COUNT(*) as count 
           FROM visit 
           WHERE receptionist_id = ? 
           AND DATE(visit_date) = CURDATE()`,
          [receptionist.receptionist_id]
        );
        
        return {
          id: receptionist.receptionist_id,
          receptionist_id: receptionist.receptionist_id,
          user_id: receptionist.user_id,
          name: receptionist.name,
          email: receptionist.email,
          phone: 'N/A', // Not in database
          shift: 'flexible', // Not in database - default value
          employeeId: receptionist.receptionist_id.substring(0, 8),
          status: 'active',
          patientsToday: patientCount[0].count,
          avatar: receptionist.name.charAt(0).toUpperCase()
        };
      })
    );
    
    console.log('✅ Receptionists with stats:', receptionistsWithStats);
    return receptionistsWithStats;
    
  } catch (error) {
    console.error('❌ Error fetching receptionists:', error);
    throw new ApiError(500, 'Failed to fetch receptionists: ' + error.message);
  }
};

/**
 * Get all visits with optional filters
 */
export const getAllVisits = async ({ date, status }) => {
  try {
    console.log('🏥 Fetching visits with filters:', { date, status });
    
    let query = `
      SELECT 
        v.visit_id,
        v.patient_id,
        v.doctor_id,
        v.receptionist_id,
        v.visit_date,
        v.visit_type,
        v.reason,
        v.status,
        p.name as patient_name,
        d.name as doctor_name
      FROM visit v
      LEFT JOIN patient_profile p ON v.patient_id = p.patient_id
      LEFT JOIN doctor d ON v.doctor_id = d.doctor_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (date) {
      query += ` AND DATE(v.visit_date) = ?`;
      params.push(date);
    }
    
    if (status && status !== 'all') {
      query += ` AND v.status = ?`;
      params.push(status);
    }
    
    query += ` ORDER BY v.visit_date DESC`;
    
    console.log('🔍 SQL Query:', query);
    console.log('🔍 Params:', params);
    
    const [visits] = await pool.execute(query, params);
    console.log('✅ Found visits:', visits.length);
    
    return visits;
    
  } catch (error) {
    console.error('❌ Error fetching visits:', error);
    throw new ApiError(500, 'Failed to fetch visits: ' + error.message);
  }
};