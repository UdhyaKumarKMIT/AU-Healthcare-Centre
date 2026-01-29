// src/services/admin.service.js
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import ApiError from '../utils/ApiError.js';
import { Op } from 'sequelize';
import sequelize from '../config/sequelize.js';
import {
  User,
  Doctor,
  StaffDetails,
  Patient,
  Visit,
  Vitals,
  Diagnosis,
  NurseTask,
  NurseTransaction,
  Prescription,
  PrescriptionTransaction,
  Medicine,
  MedicineMainStock,
  PharmacyStock,
  NurseStock,
  DressingStock,
  SystemAuditLog
} from '../models/sequelize/index.js';

export const getAdminStats = async () => {
  try {
    console.log('📊 Fetching admin stats from database...');
    
    // Get total users count
    const userCount = await User.count();
    
    // Get doctors count
    const doctorCount = await Doctor.count();
    
    // Get staff counts by role (NURSE_RECEPTIONIST, PHARMACIST, etc.)
    const nurseReceptionistCount = await StaffDetails.count({
      where: { role: 'NURSE_RECEPTIONIST' }
    });
    
    const pharmacistCount = await StaffDetails.count({
      where: { role: 'PHARMACIST' }
    });
    
    // Get patient count
    const patientCount = await Patient.count();
    
    // Get role distribution
    const roleCounts = await User.findAll({
      attributes: [
        'role',
        [sequelize.fn('COUNT', sequelize.col('role')), 'count']
      ],
      group: ['role'],
      raw: true
    });
    
    const roleCountsObj = roleCounts.reduce((acc, row) => {
      acc[row.role.toLowerCase()] = parseInt(row.count);
      return acc;
    }, {});
    
    // Get today's visits
    const todayVisits = await Visit.count({
      where: sequelize.where(
        sequelize.fn('DATE', sequelize.col('visit_date')),
        sequelize.fn('CURDATE')
      )
    });
    
    // Get new patients today
    const newPatientsToday = await Patient.count({
      where: sequelize.where(
        sequelize.fn('DATE', sequelize.col('created_at')),
        sequelize.fn('CURDATE')
      )
    });
    
    // Get active users by status
    const activeUsers = await User.count({
      where: { status: 'ACTIVE' }
    });
    
    const inactiveUsers = await User.count({
      where: { status: 'INACTIVE' }
    });
    
    const stats = {
      totalUsers: userCount,
      totalDoctors: doctorCount,
      totalReceptionists: nurseReceptionistCount,
      totalNurses: nurseReceptionistCount, // Same as receptionist in new schema
      totalPharmacists: pharmacistCount,
      totalAdministrators: roleCountsObj.admin || 0,
      totalPatients: patientCount,
      todayVisits: todayVisits,
      newPatientsToday: newPatientsToday,
      activeUsers: activeUsers,
      inactiveUsers: inactiveUsers,
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
    const demographics = await Patient.findAll({
      attributes: [
        'gender',
        [sequelize.fn('COUNT', sequelize.col('gender')), 'count']
      ],
      where: {
        gender: { [Op.ne]: null }
      },
      group: ['gender'],
      raw: true
    });
    
    // Get visit trends for last 6 months
    const visitTrends = await Visit.findAll({
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('visit_date'), '%b'), 'month'],
        [sequelize.fn('MONTH', sequelize.col('visit_date')), 'month_num'],
        [sequelize.fn('YEAR', sequelize.col('visit_date')), 'year'],
        [sequelize.fn('COUNT', sequelize.col('visit_id')), 'visits']
      ],
      where: {
        visit_date: {
          [Op.gte]: sequelize.literal('DATE_SUB(NOW(), INTERVAL 6 MONTH)')
        }
      },
      group: [
        sequelize.fn('YEAR', sequelize.col('visit_date')),
        sequelize.fn('MONTH', sequelize.col('visit_date')),
        sequelize.fn('DATE_FORMAT', sequelize.col('visit_date'), '%b')
      ],
      order: [[sequelize.literal('year'), 'ASC'], [sequelize.literal('month_num'), 'ASC']],
      raw: true
    });
    
    // Get patient type distribution
    const patientTypes = await Patient.findAll({
      attributes: [
        'patient_type',
        [sequelize.fn('COUNT', sequelize.col('patient_type')), 'count']
      ],
      group: ['patient_type'],
      raw: true
    });
    
    const result = {
      demographics: demographics.reduce((acc, row) => {
        acc[row.gender.toLowerCase()] = parseInt(row.count);
        return acc;
      }, {}),
      visitTrends: visitTrends.map(row => ({
        month: row.month,
        visits: parseInt(row.visits)
      })),
      patientTypes: patientTypes.reduce((acc, row) => {
        acc[row.patient_type] = parseInt(row.count);
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
    
    const whereClause = {};
    
    if (role && role !== 'all') {
      whereClause.role = role.toUpperCase();
    }
    
    if (status && status !== 'all') {
      whereClause.status = status.toUpperCase();
    }
    
    if (search) {
      whereClause[Op.or] = [
        { username: { [Op.like]: `%${search}%` } }
      ];
    }
    
    const users = await User.findAll({
      where: whereClause,
      include: [
        {
          model: Doctor,
          required: false,
          attributes: ['name', 'phone', 'specialization']
        },
        {
          model: StaffDetails,
          required: false,
          attributes: ['name', 'phone', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    const mappedUsers = users.map(user => {
      const userData = user.toJSON();
      const doctor = userData.Doctor;
      const staff = userData.StaffDetails && userData.StaffDetails[0];
      
      return {
        user_id: userData.user_id,
        name: doctor?.name || staff?.name || 'Unknown',
        username: userData.username,
        role: userData.role,
        status: userData.status,
        phone: doctor?.phone || staff?.phone || 'N/A',
        additional_info: doctor?.specialization || staff?.email || 'N/A',
        registeredDate: userData.created_at
      };
    });
    
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
  const transaction = await sequelize.transaction();
  
  try {
    console.log('➕ Creating user:', { name, username, role });
    
    // Check if username already exists
    const existing = await User.findOne({
      where: { username }
    });
    
    if (existing) {
      await transaction.rollback();
      throw new ApiError(409, 'User with this username already exists');
    }
    
    const userId = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert into users table
    await User.create({
      user_id: userId,
      username,
      password_hash: hashedPassword,
      role: role.toUpperCase(),
      status: 'ACTIVE',
      is_role_specific
    }, { transaction });
    
    // Create role-specific record
    if (role.toUpperCase() === 'DOCTOR') {
      await Doctor.create({
        doctor_id: crypto.randomUUID(),
        user_id: userId,
        name,
        specialization: specialization || 'General Medicine',
        phone: phone || null,
        availability_status: 'AVAILABLE'
      }, { transaction });
    } else if (role.toUpperCase() === 'NURSE_RECEPTIONIST') {
      await StaffDetails.create({
        staff_id: crypto.randomUUID(),
        user_id: userId,
        name,
        role: 'NURSE_RECEPTIONIST',
        code: code || `NR-${Date.now()}`,
        phone: phone || null,
        email: email || null,
        status: 'ACTIVE'
      }, { transaction });
    } else if (role.toUpperCase() === 'PHARMACIST') {
      await StaffDetails.create({
        staff_id: crypto.randomUUID(),
        user_id: userId,
        name,
        role: 'PHARMACIST',
        code: code || `PH-${Date.now()}`,
        phone: phone || null,
        email: email || null,
        status: 'ACTIVE'
      }, { transaction });
    }
    
    await transaction.commit();
    
    return {
      user_id: userId,
      name,
      username,
      role: role.toUpperCase(),
      phone: phone || null,
      specialization: specialization || null
    };
  } catch (error) {
    // Only rollback if transaction hasn't been committed or rolled back
    if (!transaction.finished) {
      await transaction.rollback();
    }
    
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Failed to create user: ' + error.message);
  }
};

export const updateUserStatus = async (userId, status, reason) => {
  try {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    await user.update({ status: status.toUpperCase() });
    
    // Log the status change in audit log
    await SystemAuditLog.create({
      log_id: crypto.randomUUID(),
      actor_user_id: userId,
      action: 'UPDATE_STATUS',
      entity_type: 'USER',
      entity_id: userId,
      new_value: JSON.stringify({ status: status.toUpperCase() }),
      remarks: reason || 'Status updated by admin'
    });
    
    return { message: 'User status updated successfully' };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Failed to update user status: ' + error.message);
  }
};

export const deleteUser = async (userId) => {
  const transaction = await sequelize.transaction();
  
  try {
    const user = await User.findByPk(userId, { transaction });
    
    if (!user) {
      await transaction.rollback();
      throw new ApiError(404, 'User not found');
    }
    
    // The foreign key constraints with ON DELETE CASCADE will handle related records
    await user.destroy({ transaction });
    
    // Log the deletion
    await SystemAuditLog.create({
      log_id: crypto.randomUUID(),
      action: 'DELETE',
      entity_type: 'USER',
      entity_id: userId,
      remarks: 'User deleted by admin'
    }, { transaction });
    
    await transaction.commit();
    
    return { message: 'User deleted successfully' };
  } catch (error) {
    // Only rollback if transaction hasn't been committed or rolled back
    if (!transaction.finished) {
      await transaction.rollback();
    }
    
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Failed to delete user: ' + error.message);
  }
};

export const getAllDoctors = async () => {
  try {
    const doctors = await Doctor.findAll({
      include: [{
        model: User,
        attributes: ['username', 'status', 'created_at']
      }],
      order: [['name', 'ASC']]
    });
    
    // Get today's visit count for each doctor
    const doctorsWithStats = await Promise.all(
      doctors.map(async (doctor) => {
        const doctorData = doctor.toJSON();
        
        const visitCount = await Visit.count({
          where: {
            doctor_id: doctorData.doctor_id,
            [Op.and]: sequelize.where(
              sequelize.fn('DATE', sequelize.col('visit_date')),
              sequelize.fn('CURDATE')
            )
          }
        });
        
        return {
          id: doctorData.doctor_id,
          doctor_id: doctorData.doctor_id,
          user_id: doctorData.user_id,
          name: doctorData.name,
          username: doctorData.User.username,
          email: doctorData.User.username, // Use username as email fallback
          specialization: doctorData.specialization,
          phone: doctorData.phone || 'N/A',
          availability: doctorData.availability_status,
          status: doctorData.User.status.toLowerCase(),
          patientsToday: visitCount,
          joinedDate: doctorData.User.created_at
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
    const receptionists = await StaffDetails.findAll({
      where: { role: 'NURSE_RECEPTIONIST' },
      include: [{
        model: User,
        attributes: ['username', 'created_at']
      }],
      order: [['name', 'ASC']]
    });
    
    // Get today's visit registrations for each receptionist
    const receptionistsWithStats = await Promise.all(
      receptionists.map(async (receptionist) => {
        const receptionistData = receptionist.toJSON();
        
        const visitCount = await Visit.count({
          where: {
            created_by_code: receptionistData.code,
            [Op.and]: sequelize.where(
              sequelize.fn('DATE', sequelize.col('visit_date')),
              sequelize.fn('CURDATE')
            )
          }
        });
        
        return {
          id: receptionistData.staff_id,
          staff_id: receptionistData.staff_id,
          user_id: receptionistData.user_id,
          name: receptionistData.name,
          username: receptionistData.User.username,
          email: receptionistData.email || receptionistData.User.username,
          employeeId: receptionistData.code,
          phone: receptionistData.phone || 'N/A',
          status: receptionistData.status.toLowerCase(),
          shift: 'flexible', // Can be extended with shift table
          patientsToday: visitCount,
          joinedDate: receptionistData.User.created_at
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
    const nurses = await StaffDetails.findAll({
      where: { role: 'NURSE_RECEPTIONIST' },
      include: [{
        model: User,
        attributes: ['username', 'created_at']
      }],
      order: [['name', 'ASC']]
    });
    
    // Get today's task count for each nurse
    const nursesWithStats = await Promise.all(
      nurses.map(async (nurse) => {
        const nurseData = nurse.toJSON();
        
        const taskCount = await NurseTransaction.count({
          where: {
            performed_by_code: nurseData.code,
            [Op.and]: sequelize.where(
              sequelize.fn('DATE', sequelize.col('performed_at')),
              sequelize.fn('CURDATE')
            )
          }
        });
        
        return {
          id: nurseData.staff_id,
          nurse_id: nurseData.staff_id,
          staff_id: nurseData.staff_id,
          user_id: nurseData.user_id,
          name: nurseData.name,
          username: nurseData.User.username,
          email: nurseData.email || nurseData.User.username,
          register_number: nurseData.code,
          qualification: 'RN', // Default - can be extended
          phone: nurseData.phone || 'N/A',
          status: nurseData.status.toLowerCase(),
          tasksToday: taskCount,
          joinedDate: nurseData.User.created_at
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
    const pharmacists = await StaffDetails.findAll({
      where: { role: 'PHARMACIST' },
      include: [{
        model: User,
        attributes: ['username', 'created_at']
      }],
      order: [['name', 'ASC']]
    });
    
    // Get today's prescription transactions for each pharmacist
    const pharmacistsWithStats = await Promise.all(
      pharmacists.map(async (pharmacist) => {
        const pharmacistData = pharmacist.toJSON();
        
        const transactionCount = await PrescriptionTransaction.count({
          where: {
            issued_by_code: pharmacistData.code,
            [Op.and]: sequelize.where(
              sequelize.fn('DATE', sequelize.col('issued_at')),
              sequelize.fn('CURDATE')
            )
          }
        });
        
        return {
          id: pharmacistData.staff_id,
          pharmacist_id: pharmacistData.staff_id,
          staff_id: pharmacistData.staff_id,
          user_id: pharmacistData.user_id,
          name: pharmacistData.name,
          username: pharmacistData.User.username,
          email: pharmacistData.email || pharmacistData.User.username,
          code: pharmacistData.code,
          phone: pharmacistData.phone || 'N/A',
          status: pharmacistData.status.toLowerCase(),
          transactionsToday: transactionCount,
          joinedDate: pharmacistData.User.created_at
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
    const whereClause = {};
    
    if (date) {
      whereClause[Op.and] = sequelize.where(
        sequelize.fn('DATE', sequelize.col('visit_date')),
        date
      );
    }
    
    if (status && status !== 'all') {
      whereClause.status = status.toUpperCase();
    }
    
    const visits = await Visit.findAll({
      where: whereClause,
      include: [
        {
          model: Patient,
          attributes: ['name', 'gender', 'phone']
        },
        {
          model: Doctor,
          attributes: ['name', 'specialization']
        }
      ],
      order: [['visit_date', 'DESC']],
      limit: 100
    });
    
    return visits.map(visit => {
      const visitData = visit.toJSON();
      return {
        visit_id: visitData.visit_id,
        patient_id: visitData.patient_id,
        doctor_id: visitData.doctor_id,
        visit_date: visitData.visit_date,
        reason: visitData.reason,
        status: visitData.status,
        created_by_code: visitData.created_by_code,
        patient_name: visitData.Patient?.name,
        gender: visitData.Patient?.gender,
        patient_phone: visitData.Patient?.phone,
        doctor_name: visitData.Doctor?.name,
        specialization: visitData.Doctor?.specialization
      };
    });
    
  } catch (error) {
    throw new ApiError(500, 'Failed to fetch visits: ' + error.message);
  }
};

export const getMedicineInventory = async ({ status, search }) => {
  try {
    const whereClause = {};
    
    if (search) {
      whereClause.name = { [Op.like]: `%${search}%` };
    }
    
    const medicines = await Medicine.findAll({
      where: whereClause,
      attributes: [
        'medicine_id',
        'name',
        'type',
        [sequelize.fn('COALESCE', sequelize.literal('(SELECT SUM(quantity) FROM medicine_main_stock WHERE medicine_id = Medicine.medicine_id)'), 0), 'main_stock'],
        [sequelize.fn('COALESCE', sequelize.literal('(SELECT SUM(quantity) FROM pharmacy_stock WHERE medicine_id = Medicine.medicine_id)'), 0), 'pharmacy_stock'],
        [sequelize.fn('COALESCE', sequelize.literal('(SELECT SUM(quantity) FROM nurse_stock WHERE medicine_id = Medicine.medicine_id)'), 0), 'nurse_stock'],
        [sequelize.fn('COALESCE', sequelize.literal('(SELECT SUM(quantity) FROM dressing_stock WHERE medicine_id = Medicine.medicine_id)'), 0), 'dressing_stock'],
        [sequelize.literal('(SELECT COUNT(DISTINCT batch_no) FROM medicine_main_stock WHERE medicine_id = Medicine.medicine_id)'), 'batch_count'],
        [sequelize.literal('(SELECT MIN(expiry) FROM medicine_main_stock WHERE medicine_id = Medicine.medicine_id)'), 'nearest_expiry']
      ],
      order: [['name', 'ASC']],
      raw: true
    });
    
    return medicines.map(item => {
      const total_stock = parseInt(item.main_stock) + parseInt(item.pharmacy_stock) + parseInt(item.nurse_stock) + parseInt(item.dressing_stock);
      
      return {
        medicine_id: item.medicine_id,
        name: item.name,
        type: item.type,
        main_stock: parseInt(item.main_stock),
        pharmacy_stock: parseInt(item.pharmacy_stock),
        nurse_stock: parseInt(item.nurse_stock),
        dressing_stock: parseInt(item.dressing_stock),
        total_stock: total_stock,
        batch_count: parseInt(item.batch_count),
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
    
    const whereClause = {};

    if (startDate) {
      whereClause.created_at = { [Op.gte]: startDate };
    }

    if (endDate) {
      if (whereClause.created_at) {
        whereClause.created_at = { ...whereClause.created_at, [Op.lte]: endDate };
      } else {
        whereClause.created_at = { [Op.lte]: endDate };
      }
    }

    const logs = await SystemAuditLog.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: 200,
      raw: true
    });
    
    console.log(`✅ Found ${logs.length} log entries`);
    
    // Format the logs for better readability with safe JSON parsing
    const formattedLogs = logs.map(log => {
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