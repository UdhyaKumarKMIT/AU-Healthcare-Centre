// src/services/admin.service.js
import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import ApiError from '../utils/ApiError.js';

export const getAdminStats = async () => {
  try {
    console.log('📊 Fetching admin stats from database...');
    
    // Get total users count
    const [userCount] = await pool.execute(
      `SELECT COUNT(*) as total FROM users`
    );
    
    // Get doctors count
    const [doctorCount] = await pool.execute(
      `SELECT COUNT(*) as total FROM doctor`
    );
    
    // Get staff counts by role (NURSE_RECEPTIONIST, PHARMACIST, etc.)
    const [nurseReceptionistCount] = await pool.execute(
      `SELECT COUNT(*) as total 
       FROM staff_details 
       WHERE role = 'NURSE_RECEPTIONIST'`
    );
    
    const [pharmacistCount] = await pool.execute(
      `SELECT COUNT(*) as total 
       FROM staff_details 
       WHERE role = 'PHARMACIST'`
    );
    
    // Get patient count
    const [patientCount] = await pool.execute(
      `SELECT COUNT(*) as total FROM patient`
    );
    
    // Get role distribution
    const [roleCounts] = await pool.execute(
      `SELECT role, COUNT(*) as count FROM users GROUP BY role`
    );
    
    const roleCountsObj = roleCounts.reduce((acc, row) => {
      acc[row.role.toLowerCase()] = row.count;
      return acc;
    }, {});
    
    // Get today's visits
    const [todayVisits] = await pool.execute(
      `SELECT COUNT(*) as total FROM visit 
       WHERE DATE(visit_date) = CURDATE()`
    );
    
    // Get new patients today (first visit today)
    const [newPatientsToday] = await pool.execute(
      `SELECT COUNT(DISTINCT patient_id) as total 
       FROM patient 
       WHERE DATE(created_at) = CURDATE()`
    );
    
    // Get active users by status
    const [activeUsers] = await pool.execute(
      `SELECT COUNT(*) as total FROM users WHERE status = 'ACTIVE'`
    );
    
    const [inactiveUsers] = await pool.execute(
      `SELECT COUNT(*) as total FROM users WHERE status = 'INACTIVE'`
    );
    
    const stats = {
      totalUsers: userCount[0].total,
      totalDoctors: doctorCount[0].total,
      totalReceptionists: nurseReceptionistCount[0].total,
      totalNurses: nurseReceptionistCount[0].total, // Same as receptionist in new schema
      totalPharmacists: pharmacistCount[0].total,
      totalAdministrators: roleCountsObj.admin || 0,
      totalPatients: patientCount[0].total,
      todayVisits: todayVisits[0].total,
      newPatientsToday: newPatientsToday[0].total,
      activeUsers: activeUsers[0].total,
      inactiveUsers: inactiveUsers[0].total,
      roleDistribution: roleCountsObj
    };
    
    console.log('✅ Final Stats Object:', stats);
    return stats;
    
  } catch (error) {
    console.error('❌ Error fetching admin stats:', error);
    throw new ApiError(500, 'Failed to fetch admin statistics: ' + error.message);
  }
};

export const getPatientOverview = async () => {
  try {
    console.log('📊 Fetching patient overview...');
    
    // Get patient demographics by gender
    const [demographics] = await pool.execute(
      `SELECT 
         gender,
         COUNT(*) as count
       FROM patient
       WHERE gender IS NOT NULL
       GROUP BY gender`
    );
    
    // Get visit trends for last 6 months
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
    
    // Get patient type distribution
    const [patientTypes] = await pool.execute(
      `SELECT 
         patient_type,
         COUNT(*) as count
       FROM patient
       GROUP BY patient_type`
    );
    
    const result = {
      demographics: demographics.reduce((acc, row) => {
        acc[row.gender.toLowerCase()] = row.count;
        return acc;
      }, {}),
      visitTrends: visitTrends.map(row => ({
        month: row.month,
        visits: row.visits
      })),
      patientTypes: patientTypes.reduce((acc, row) => {
        acc[row.patient_type] = row.count;
        return acc;
      }, {})
    };
    
    return result;
    
  } catch (error) {
    console.error('❌ Error fetching patient overview:', error);
    throw new ApiError(500, 'Failed to fetch patient overview: ' + error.message);
  }
};

export const getAllUsers = async ({ role, status, search }) => {
  try {
    console.log('👥 Fetching users with filters:', { role, status, search });
    
    let query = `
      SELECT 
        u.user_id,
        u.username,
        u.role,
        u.status,
        u.created_at,
        COALESCE(d.name, s.name, 'Unknown') as name,
        COALESCE(d.phone, s.phone, 'N/A') as phone,
        COALESCE(d.specialization, s.email, 'N/A') as additional_info
      FROM users u
      LEFT JOIN doctor d ON u.user_id = d.user_id
      LEFT JOIN staff_details s ON u.user_id = s.user_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (role && role !== 'all') {
      query += ` AND u.role = ?`;
      params.push(role.toUpperCase());
    }
    
    if (status && status !== 'all') {
      query += ` AND u.status = ?`;
      params.push(status.toUpperCase());
    }
    
    if (search) {
      query += ` AND (u.username LIKE ? OR d.name LIKE ? OR s.name LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }
    
    query += ` ORDER BY u.created_at DESC`;
    
    const [users] = await pool.execute(query, params);
    
    const mappedUsers = users.map(user => ({
      user_id: user.user_id,
      name: user.name,
      username: user.username,
      role: user.role,
      status: user.status,
      phone: user.phone,
      additional_info: user.additional_info,
      registeredDate: user.created_at
    }));
    
    return mappedUsers;
    
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    throw new ApiError(500, 'Failed to fetch users: ' + error.message);
  }
};

export const createUser = async ({ 
  name, 
  username, 
  password, 
  role, 
  phone, 
  email,
  specialization, 
  code,
  is_role_specific = false 
}) => {
  const connection = await pool.getConnection();
  
  try {
    console.log('➕ Creating user:', { name, username, role });
    await connection.beginTransaction();
    
    // Check if username already exists
    const [existing] = await connection.execute(
      `SELECT user_id FROM users WHERE username = ?`,
      [username]
    );
    
    if (existing.length > 0) {
      throw new ApiError(409, 'User with this username already exists');
    }
    
    const userId = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert into users table
    await connection.execute(
      `INSERT INTO users (user_id, username, password_hash, role, status, created_at, is_role_specific)
       VALUES (?, ?, ?, ?, 'ACTIVE', NOW(), ?)`,
      [userId, username, hashedPassword, role.toUpperCase(), is_role_specific]
    );
    
    // Create role-specific record
    if (role.toUpperCase() === 'DOCTOR') {
      const doctorId = crypto.randomUUID();
      await connection.execute(
        `INSERT INTO doctor (doctor_id, user_id, name, specialization, phone, availability_status)
         VALUES (?, ?, ?, ?, ?, 'AVAILABLE')`,
        [doctorId, userId, name, specialization || 'General Medicine', phone || null]
      );
    } else if (role.toUpperCase() === 'NURSE_RECEPTIONIST') {
      const staffId = crypto.randomUUID();
      await connection.execute(
        `INSERT INTO staff_details (staff_id, user_id, name, role, code, phone, email, status)
         VALUES (?, ?, ?, 'NURSE_RECEPTIONIST', ?, ?, ?, 'ACTIVE')`,
        [staffId, userId, name, code || `NR-${Date.now()}`, phone || null, email || null]
      );
    } else if (role.toUpperCase() === 'PHARMACIST') {
      const staffId = crypto.randomUUID();
      await connection.execute(
        `INSERT INTO staff_details (staff_id, user_id, name, role, code, phone, email, status)
         VALUES (?, ?, ?, 'PHARMACIST', ?, ?, ?, 'ACTIVE')`,
        [staffId, userId, name, code || `PH-${Date.now()}`, phone || null, email || null]
      );
    }
    
    await connection.commit();
    
    return {
      user_id: userId,
      name,
      username,
      role: role.toUpperCase(),
      phone: phone || null,
      specialization: specialization || null
    };
  } catch (error) {
    await connection.rollback();
    
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Failed to create user: ' + error.message);
  } finally {
    connection.release();
  }
};

export const updateUserStatus = async (userId, status, reason) => {
  try {
    const [users] = await pool.execute(
      `SELECT user_id FROM users WHERE user_id = ?`,
      [userId]
    );
    
    if (users.length === 0) {
      throw new ApiError(404, 'User not found');
    }
    
    await pool.execute(
      `UPDATE users SET status = ? WHERE user_id = ?`,
      [status.toUpperCase(), userId]
    );
    
    // Log the status change in audit log
    await pool.execute(
      `INSERT INTO system_audit_log (
        log_id, actor_user_id, action, entity_type, entity_id, 
        new_value, remarks, created_at
      ) VALUES (?, ?, 'UPDATE_STATUS', 'USER', ?, ?, ?, NOW())`,
      [
        crypto.randomUUID(),
        userId,
        userId,
        JSON.stringify({ status: status.toUpperCase() }),
        reason || 'Status updated by admin'
      ]
    );
    
    return { message: 'User status updated successfully' };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Failed to update user status: ' + error.message);
  }
};

export const deleteUser = async (userId) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const [users] = await connection.execute(
      `SELECT user_id, role FROM users WHERE user_id = ?`,
      [userId]
    );
    
    if (users.length === 0) {
      throw new ApiError(404, 'User not found');
    }
    
    // The foreign key constraints with ON DELETE CASCADE will handle related records
    await connection.execute(
      `DELETE FROM users WHERE user_id = ?`,
      [userId]
    );
    
    // Log the deletion
    await connection.execute(
      `INSERT INTO system_audit_log (
        log_id, action, entity_type, entity_id, remarks, created_at
      ) VALUES (?, 'DELETE', 'USER', ?, 'User deleted by admin', NOW())`,
      [crypto.randomUUID(), userId]
    );
    
    await connection.commit();
    
    return { message: 'User deleted successfully' };
  } catch (error) {
    await connection.rollback();
    
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Failed to delete user: ' + error.message);
  } finally {
    connection.release();
  }
};

export const getAllDoctors = async () => {
  try {
    const [doctors] = await pool.execute(
      `SELECT 
        d.doctor_id,
        d.user_id,
        d.name,
        d.specialization,
        d.phone,
        d.availability_status,
        u.username,
        u.status,
        u.created_at
      FROM doctor d
      JOIN users u ON d.user_id = u.user_id
      ORDER BY d.name ASC`
    );
    
    // Get today's visit count for each doctor
    const doctorsWithStats = await Promise.all(
      doctors.map(async (doctor) => {
        const [visitCount] = await pool.execute(
          `SELECT COUNT(*) as count 
           FROM visit 
           WHERE doctor_id = ? 
           AND DATE(visit_date) = CURDATE()`,
          [doctor.doctor_id]
        );
        
        return {
          id: doctor.doctor_id,
          doctor_id: doctor.doctor_id,
          user_id: doctor.user_id,
          name: doctor.name,
          username: doctor.username,
          email: doctor.username, // Use username as email fallback
          specialization: doctor.specialization,
          phone: doctor.phone || 'N/A',
          availability: doctor.availability_status,
          status: doctor.status.toLowerCase(),
          patientsToday: visitCount[0].count,
          joinedDate: doctor.created_at
        };
      })
    );
    
    return doctorsWithStats;
    
  } catch (error) {
    throw new ApiError(500, 'Failed to fetch doctors: ' + error.message);
  }
};

export const getAllReceptionists = async () => {
  try {
    const [receptionists] = await pool.execute(
      `SELECT 
        s.staff_id,
        s.user_id,
        s.name,
        s.code,
        s.phone,
        s.email,
        s.status,
        u.username,
        u.created_at
      FROM staff_details s
      JOIN users u ON s.user_id = u.user_id
      WHERE s.role = 'NURSE_RECEPTIONIST'
      ORDER BY s.name ASC`
    );
    
    // Get today's visit registrations for each receptionist
    const receptionistsWithStats = await Promise.all(
      receptionists.map(async (receptionist) => {
        const [visitCount] = await pool.execute(
          `SELECT COUNT(*) as count 
           FROM visit 
           WHERE created_by_code = ? 
           AND DATE(visit_date) = CURDATE()`,
          [receptionist.code]
        );
        
        return {
          id: receptionist.staff_id,
          staff_id: receptionist.staff_id,
          user_id: receptionist.user_id,
          name: receptionist.name,
          username: receptionist.username,
          email: receptionist.email || receptionist.username,
          employeeId: receptionist.code,
          phone: receptionist.phone || 'N/A',
          status: receptionist.status.toLowerCase(),
          shift: 'flexible', // Can be extended with shift table
          patientsToday: visitCount[0].count,
          joinedDate: receptionist.created_at
        };
      })
    );
    
    return receptionistsWithStats;
    
  } catch (error) {
    throw new ApiError(500, 'Failed to fetch receptionists: ' + error.message);
  }
};

export const getAllNurses = async () => {
  try {
    // In the new schema, nurses are part of staff_details with role NURSE_RECEPTIONIST
    const [nurses] = await pool.execute(
      `SELECT 
        s.staff_id,
        s.user_id,
        s.name,
        s.code,
        s.phone,
        s.email,
        s.status,
        u.username,
        u.created_at
      FROM staff_details s
      JOIN users u ON s.user_id = u.user_id
      WHERE s.role = 'NURSE_RECEPTIONIST'
      ORDER BY s.name ASC`
    );
    
    // Get today's task count for each nurse
    const nursesWithStats = await Promise.all(
      nurses.map(async (nurse) => {
        const [taskCount] = await pool.execute(
          `SELECT COUNT(*) as count 
           FROM nurse_transaction nt
           WHERE nt.performed_by_code = ? 
           AND DATE(nt.performed_at) = CURDATE()`,
          [nurse.code]
        );
        
        return {
          id: nurse.staff_id,
          nurse_id: nurse.staff_id,
          staff_id: nurse.staff_id,
          user_id: nurse.user_id,
          name: nurse.name,
          username: nurse.username,
          email: nurse.email || nurse.username,
          register_number: nurse.code,
          qualification: 'RN', // Default - can be extended
          phone: nurse.phone || 'N/A',
          status: nurse.status.toLowerCase(),
          tasksToday: taskCount[0].count,
          joinedDate: nurse.created_at
        };
      })
    );
    
    return nursesWithStats;
    
  } catch (error) {
    throw new ApiError(500, 'Failed to fetch nurses: ' + error.message);
  }
};

export const getAllPharmacists = async () => {
  try {
    const [pharmacists] = await pool.execute(
      `SELECT 
        s.staff_id,
        s.user_id,
        s.name,
        s.code,
        s.phone,
        s.email,
        s.status,
        u.username,
        u.created_at
      FROM staff_details s
      JOIN users u ON s.user_id = u.user_id
      WHERE s.role = 'PHARMACIST'
      ORDER BY s.name ASC`
    );
    
    // Get today's prescription transactions for each pharmacist
    const pharmacistsWithStats = await Promise.all(
      pharmacists.map(async (pharmacist) => {
        const [transactionCount] = await pool.execute(
          `SELECT COUNT(*) as count 
           FROM prescription_transaction 
           WHERE issued_by_code = ? 
           AND DATE(issued_at) = CURDATE()`,
          [pharmacist.code]
        );
        
        return {
          id: pharmacist.staff_id,
          pharmacist_id: pharmacist.staff_id,
          staff_id: pharmacist.staff_id,
          user_id: pharmacist.user_id,
          name: pharmacist.name,
          username: pharmacist.username,
          email: pharmacist.email || pharmacist.username,
          code: pharmacist.code,
          phone: pharmacist.phone || 'N/A',
          status: pharmacist.status.toLowerCase(),
          transactionsToday: transactionCount[0].count,
          joinedDate: pharmacist.created_at
        };
      })
    );
    
    return pharmacistsWithStats;
    
  } catch (error) {
    throw new ApiError(500, 'Failed to fetch pharmacists: ' + error.message);
  }
};

export const getAllVisits = async ({ date, status }) => {
  try {
    let query = `
      SELECT 
        v.visit_id,
        v.patient_id,
        v.doctor_id,
        v.visit_date,
        v.reason,
        v.status,
        v.created_by_code,
                p.name as patient_name,
        p.gender,
        p.phone as patient_phone,
        d.name as doctor_name,
        d.specialization
      FROM visit v
      LEFT JOIN patient p ON v.patient_id = p.patient_id
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
      params.push(status.toUpperCase());
    }
    
    query += ` ORDER BY v.visit_date DESC LIMIT 100`;
    
    const [visits] = await pool.execute(query, params);
    
    return visits;
    
  } catch (error) {
    throw new ApiError(500, 'Failed to fetch visits: ' + error.message);
  }
};

export const getMedicineInventory = async ({ status, search }) => {
  try {
    let query = `
      SELECT 
        m.medicine_id,
        m.name,
        m.type,
        COALESCE(SUM(mms.quantity), 0) as main_stock,
        COALESCE(SUM(ps.quantity), 0) as pharmacy_stock,
        COALESCE(SUM(ns.quantity), 0) as nurse_stock,
        COALESCE(SUM(ds.quantity), 0) as dressing_stock,
        COUNT(DISTINCT mms.batch_no) as batch_count,
        MIN(mms.expiry) as nearest_expiry
      FROM medicine m
      LEFT JOIN medicine_main_stock mms ON m.medicine_id = mms.medicine_id
      LEFT JOIN pharmacy_stock ps ON m.medicine_id = ps.medicine_id
      LEFT JOIN nurse_stock ns ON m.medicine_id = ns.medicine_id
      LEFT JOIN dressing_stock ds ON m.medicine_id = ds.medicine_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (search) {
      query += ` AND m.name LIKE ?`;
      params.push(`%${search}%`);
    }
    
    query += ` GROUP BY m.medicine_id, m.name, m.type ORDER BY m.name ASC`;
    
    const [inventory] = await pool.execute(query, params);
    
    return inventory.map(item => {
      const total_stock = item.main_stock + item.pharmacy_stock + item.nurse_stock + item.dressing_stock;
      
      return {
        medicine_id: item.medicine_id,
        name: item.name,
        type: item.type,
        main_stock: item.main_stock,
        pharmacy_stock: item.pharmacy_stock,
        nurse_stock: item.nurse_stock,
        dressing_stock: item.dressing_stock,
        total_stock: total_stock,
        batch_count: item.batch_count,
        nearest_expiry: item.nearest_expiry,
        status: total_stock === 0 ? 'OUT_OF_STOCK' : 
                total_stock < 20 ? 'LOW_STOCK' : 'IN_STOCK'
      };
    });
    
  } catch (error) {
    throw new ApiError(500, 'Failed to fetch medicine inventory: ' + error.message);
  }
};

// FIXED: Safe JSON parsing with proper error handling
const safeJsonParse = (jsonString) => {
  if (!jsonString) return null;
  if (typeof jsonString === 'object') return jsonString; // Already parsed
  
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.warn('Failed to parse JSON:', jsonString);
    return null;
  }
};

export const getSystemLogs = async ({ startDate, endDate }) => {
  try {
    console.log('📋 Fetching system logs...');
    
    let query = `
      SELECT
        log_id,
        actor_user_id,
        actor_code,
        actor_role,
        action,
        entity_type,
        entity_id,
        old_value,
        new_value,
        remarks,
        ip_address,
        user_agent,
        created_at
      FROM system_audit_log
      WHERE 1=1
    `;

    const params = [];

    if (startDate) {
      query += ` AND DATE(created_at) >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND DATE(created_at) <= ?`;
      params.push(endDate);
    }

    query += `
      ORDER BY created_at DESC
      LIMIT 200
    `;

    console.log('Executing query:', query);
    console.log('With params:', params);

    const [rows] = await pool.execute(query, params);
    
    console.log(`✅ Found ${rows.length} log entries`);
    
    // Format the logs for better readability with safe JSON parsing
    const formattedLogs = rows.map(log => {
      try {
        return {
          log_id: log.log_id,
          timestamp: log.created_at,
          user_id: log.actor_user_id,
          user_name: log.actor_code || 'System',
          action: log.action,
          description: log.remarks || `${log.action} on ${log.entity_type}`,
          entity_type: log.entity_type,
          entity_id: log.entity_id,
          old_value: safeJsonParse(log.old_value),
          new_value: safeJsonParse(log.new_value),
          ip_address: log.ip_address,
          user_agent: log.user_agent
        };
      } catch (error) {
        console.error('Error formatting log entry:', log.log_id, error);
        // Return a safe version even if there's an error
        return {
          log_id: log.log_id,
          timestamp: log.created_at,
          user_id: log.actor_user_id,
          user_name: 'Unknown',
          action: log.action || 'UNKNOWN',
          description: 'Log entry with formatting error',
          entity_type: log.entity_type,
          entity_id: log.entity_id,
          old_value: null,
          new_value: null,
          ip_address: null,
          user_agent: null
        };
      }
    });
    
    return formattedLogs;

  } catch (error) {
    console.error('❌ Error in getSystemLogs:', error);
    console.error('Error stack:', error.stack);
    
    // Return more specific error information
    throw new ApiError(
      500, 
      `Failed to fetch system logs: ${error.message}. Please check if the system_audit_log table exists.`
    );
  }
};