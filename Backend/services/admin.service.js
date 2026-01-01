// src/services/admin.service.js
import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import ApiError from '../utils/ApiError.js';

export const getAdminStats = async () => {
  try {
    console.log('📊 Fetching admin stats from database...');
    
    const [userCount] = await pool.execute(
      `SELECT COUNT(*) as total FROM users`
    );
    
    const [doctorCount] = await pool.execute(
      `SELECT COUNT(*) as total FROM doctor`
    );
    
    const [receptionistCount] = await pool.execute(
      `SELECT COUNT(*) as total FROM receptionist`
    );
    
    const [patientCount] = await pool.execute(
      `SELECT COUNT(*) as total FROM patient_profile`
    );

    const [nurseCount] = await pool.execute(
      `SELECT COUNT(*) as total FROM nurse`
    );

    const [pharmacistCount] = await pool.execute(
      `SELECT COUNT(*) as total FROM pharmacist`
    );
    
    const [roleCounts] = await pool.execute(
      `SELECT role, COUNT(*) as count FROM users GROUP BY role`
    );
    
    const roleCountsObj = roleCounts.reduce((acc, row) => {
      acc[row.role.toLowerCase()] = row.count;
      return acc;
    }, {});
    
    const [todayVisits] = await pool.execute(
      `SELECT COUNT(*) as total FROM visit 
       WHERE DATE(visit_date) = CURDATE()`
    );
    
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
    
    const stats = {
      totalUsers: userCount[0].total,
      totalDoctors: doctorCount[0].total,
      totalReceptionists: receptionistCount[0].total,
      totalNurses: nurseCount[0].total,
      totalPharmacists: pharmacistCount[0].total,
      totalAdministrators: roleCountsObj.admin || 0,
      totalPatients: patientCount[0].total,
      todayVisits: todayVisits[0].total,
      newPatientsToday: newPatientsToday[0].total
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
    
    const [demographics] = await pool.execute(
      `SELECT 
         gender,
         COUNT(*) as count
       FROM patient_profile
       WHERE gender IS NOT NULL
       GROUP BY gender`
    );
    
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
        u.email,
        u.role,
        COALESCE(d.name, r.receptionist_name, n.name, p.name, 'Unknown') as name,
        COALESCE(d.doctor_id, r.receptionist_id, n.nurse_id, CAST(p.pharmacist_id AS CHAR)) as role_id,
        COALESCE(d.specialization, n.qualification, 'N/A') as department,
        COALESCE(d.phone, n.phone, p.phone, 'N/A') as phone
      FROM users u
      LEFT JOIN doctor d ON u.user_id = d.user_id AND u.role = 'DOCTOR'
      LEFT JOIN receptionist r ON u.user_id = r.user_id AND u.role = 'RECEPTIONIST'
      LEFT JOIN nurse n ON u.user_id = n.user_id AND u.role = 'NURSE'
      LEFT JOIN pharmacist p ON u.user_id = p.user_id AND u.role = 'PHARMACIST'
      WHERE 1=1
    `;
    
    const params = [];
    
    if (role && role !== 'all') {
      query += ` AND u.role = ?`;
      params.push(role.toUpperCase());
    }
    
    if (search) {
      query += ` AND (u.email LIKE ? OR d.name LIKE ? OR r.receptionist_name LIKE ? OR n.name LIKE ? OR p.name LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
    }
    
    query += ` ORDER BY u.email ASC`;
    
    const [users] = await pool.execute(query, params);
    
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
    
    return mappedUsers;
    
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    throw new ApiError(500, 'Failed to fetch users: ' + error.message);
  }
};

export const createUser = async ({ name, email, password, role, phone, specialization, qualification, register_number }) => {
  const connection = await pool.getConnection();
  
  try {
    console.log('➕ Creating user:', { name, email, role });
    await connection.beginTransaction();
    
    const [existing] = await connection.execute(
      `SELECT user_id FROM users WHERE email = ?`,
      [email]
    );
    
    if (existing.length > 0) {
      throw new ApiError(409, 'User with this email already exists');
    }
    
    const userId = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await connection.execute(
      `INSERT INTO users (user_id, email, password, role)
       VALUES (?, ?, ?, ?)`,
      [userId, email, hashedPassword, role.toUpperCase()]
    );
    
    if (role.toUpperCase() === 'DOCTOR') {
      const doctorId = crypto.randomUUID();
      await connection.execute(
        `INSERT INTO doctor (doctor_id, user_id, name, specialization, phone, availability_status)
         VALUES (?, ?, ?, ?, ?, 'AVAILABLE')`,
        [doctorId, userId, name, specialization || 'General', phone || null]
      );
    } else if (role.toUpperCase() === 'RECEPTIONIST') {
      const receptionistId = crypto.randomUUID();
      await connection.execute(
        `INSERT INTO receptionist (receptionist_id, user_id, receptionist_name)
         VALUES (?, ?, ?)`,
        [receptionistId, userId, name]
      );
    } else if (role.toUpperCase() === 'NURSE') {
      const nurseId = crypto.randomUUID();
      await connection.execute(
        `INSERT INTO nurse (nurse_id, user_id, name, qualification, phone, register_number)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [nurseId, userId, name, qualification || 'RN', phone || null, register_number || `RN-${Date.now()}`]
      );
    } else if (role.toUpperCase() === 'PHARMACIST') {
      await connection.execute(
        `INSERT INTO pharmacist (user_id, name, email, phone, password_hash)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, name, email, phone || null, hashedPassword]
      );
    }
    
    await connection.commit();
    
    return {
      user_id: userId,
      name,
      email,
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
      `SELECT user_id, role FROM users WHERE user_id = ?`,
      [userId]
    );
    
    if (users.length === 0) {
      throw new ApiError(404, 'User not found');
    }
    
    return { 
      userId, 
      status, 
      reason,
      message: 'Status tracking not yet implemented. Add status column to users table.'
    };
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
    
    const user = users[0];
    
    if (user.role === 'DOCTOR') {
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
    } else if (user.role === 'NURSE') {
      await connection.execute(`DELETE FROM nurse WHERE user_id = ?`, [userId]);
    } else if (user.role === 'PHARMACIST') {
      await connection.execute(`DELETE FROM pharmacist WHERE user_id = ?`, [userId]);
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
    
    await connection.execute(`DELETE FROM users WHERE user_id = ?`, [userId]);
    
    await connection.commit();
    
    return { 
      userId,
      message: 'User deleted successfully'
    };
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
        u.email
      FROM doctor d
      JOIN users u ON d.user_id = u.user_id
      ORDER BY d.name ASC`
    );
    
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
    throw new ApiError(500, 'Failed to fetch doctors: ' + error.message);
  }
};

export const getAllReceptionists = async () => {
  try {
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
          phone: 'N/A',
          shift: 'flexible',
          employeeId: receptionist.receptionist_id.substring(0, 8),
          status: 'active',
          patientsToday: patientCount[0].count,
          avatar: receptionist.name.charAt(0).toUpperCase()
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
    const [nurses] = await pool.execute(
      `SELECT 
        n.nurse_id,
        n.user_id,
        n.name,
        n.qualification,
        n.phone,
        n.register_number,
        u.email,
        n.created_at
      FROM nurse n
      JOIN users u ON n.user_id = u.user_id
      ORDER BY n.name ASC`
    );
    
    const nursesWithStats = await Promise.all(
      nurses.map(async (nurse) => {
        const [taskCount] = await pool.execute(
          `SELECT COUNT(*) as count 
           FROM nurse_task 
           WHERE nurse_id = ? 
           AND DATE(created_at) = CURDATE()`,
          [nurse.nurse_id]
        );
        
        return {
          id: nurse.nurse_id,
          nurse_id: nurse.nurse_id,
          user_id: nurse.user_id,
          name: nurse.name,
          email: nurse.email,
          qualification: nurse.qualification,
          phone: nurse.phone || 'N/A',
          register_number: nurse.register_number,
          status: 'active',
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
        p.pharmacist_id,
        p.user_id,
        p.name,
        p.email,
        p.phone,
        p.created_at
      FROM pharmacist p
      ORDER BY p.name ASC`
    );
    
    const pharmacistsWithStats = await Promise.all(
      pharmacists.map(async (pharmacist) => {
        const [transactionCount] = await pool.execute(
          `SELECT COUNT(*) as count 
           FROM pharmacy_transaction 
           WHERE pharmacist_id = ? 
           AND DATE(issued_at) = CURDATE()`,
          [pharmacist.pharmacist_id]
        );
        
        return {
          id: pharmacist.pharmacist_id,
          pharmacist_id: pharmacist.pharmacist_id,
          user_id: pharmacist.user_id,
          name: pharmacist.name,
          email: pharmacist.email,
          phone: pharmacist.phone || 'N/A',
          status: 'active',
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
        m.created_at,
        COALESCE(SUM(mb.in_stock), 0) as total_stock,
        COUNT(DISTINCT mb.batch_id) as batch_count,
        MIN(mb.expiry_date) as nearest_expiry
      FROM medicine m
      LEFT JOIN medicine_batch mb ON m.medicine_id = mb.medicine_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status && status !== 'all') {
      query += ` AND mb.status = ?`;
      params.push(status.toUpperCase());
    }
    
    if (search) {
      query += ` AND m.name LIKE ?`;
      params.push(`%${search}%`);
    }
    
    query += ` GROUP BY m.medicine_id, m.name, m.type, m.created_at ORDER BY m.name ASC`;
    
    const [inventory] = await pool.execute(query, params);
    
    return inventory.map(item => ({
      medicine_id: item.medicine_id,
      name: item.name,
      type: item.type,
      total_stock: item.total_stock,
      batch_count: item.batch_count,
      nearest_expiry: item.nearest_expiry,
      status: item.total_stock === 0 ? 'OUT_OF_STOCK' : 
              item.total_stock < 10 ? 'LOW_STOCK' : 'IN_STOCK'
    }));
    
  } catch (error) {
    throw new ApiError(500, 'Failed to fetch medicine inventory: ' + error.message);
  }
};

export const getSystemLogs = async ({ startDate, endDate }) => {
  try {
    let query = `
      (
        SELECT
          'PHARMACY'                    AS transaction_type,
          pt.transaction_id             AS log_id,
          pt.issued_at                  AS timestamp,
          'PHARMACY_ISSUED'             AS action,

          ph.pharmacist_id              AS pharmacist_id,
          ph.user_id                    AS pharmacist_user_id,
          NULL                          AS nurse_id,
          NULL                          AS nurse_user_id,

          pr.prescription_id            AS prescription_id,
          v.visit_id                    AS visit_id,
          v.patient_id                  AS patient_id,
          v.doctor_id                   AS doctor_id,

          m.name                        AS medicine_name,
          pt.issued_days                AS issued_days,

          CONCAT(
            'Medicine ', m.name,
            ' issued for ', pt.issued_days,
            ' days'
          ) AS description

        FROM pharmacy_transaction pt
        JOIN pharmacist ph
          ON pt.pharmacist_id = ph.pharmacist_id
        JOIN prescription pr
          ON pt.prescription_id = pr.prescription_id
        JOIN visit v
          ON pr.visit_id = v.visit_id
        JOIN prescription_items pi
          ON pr.prescription_id = pi.prescription_id
        JOIN medicine m
          ON pi.medicine_id = m.medicine_id
      )

      UNION ALL

      (
        SELECT
          'NURSE'                       AS transaction_type,
          nt.nurse_txn_id               AS log_id,
          nt.performed_at               AS timestamp,
          'NURSE_TASK_COMPLETED'        AS action,

          NULL                          AS pharmacist_id,
          NULL                          AS pharmacist_user_id,
          n.nurse_id                    AS nurse_id,
          n.user_id                     AS nurse_user_id,

          NULL                          AS prescription_id,
          v.visit_id                    AS visit_id,
          v.patient_id                  AS patient_id,
          v.doctor_id                   AS doctor_id,

          m.name                        AS medicine_name,
          NULL                          AS issued_days,

          CONCAT(
            'Nurse task completed. Observation: ',
            COALESCE(nt.observation, 'None')
          ) AS description

        FROM nurse_transaction nt
        JOIN nurse n
          ON nt.nurse_id = n.nurse_id
        JOIN nurse_task t
          ON nt.task_id = t.task_id
        JOIN visit v
          ON t.visit_id = v.visit_id
        LEFT JOIN nurse_task_details nd
          ON t.task_id = nd.task_id
        LEFT JOIN medicine m
          ON nd.medicine_id = m.medicine_id
      )
    `;

    const params = [];

    if (startDate) {
      query += ` AND DATE(timestamp) >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND DATE(timestamp) <= ?`;
      params.push(endDate);
    }

    query += `
      ORDER BY timestamp DESC
      LIMIT 200
    `;

    const [rows] = await pool.execute(query, params);
    return rows;

  } catch (error) {
    throw new ApiError(500, 'Failed to fetch system logs: ' + error.message);
  }
};

