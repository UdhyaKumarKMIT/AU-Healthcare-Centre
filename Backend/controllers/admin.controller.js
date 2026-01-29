// src/controllers/admin.controller.js
import * as adminService from '../services/admin.service.js';

export const getAdminStats = async (req, res, next) => {
  try {
    const stats = await adminService.getAdminStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};

export const getPatientOverview = async (req, res, next) => {
  try {
    const overview = await adminService.getPatientOverview();
    res.json({ success: true, data: overview });
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;
    const users = await adminService.getAllUsers({ role, status, search });
    res.json({ success: true, data: users, count: users.length });
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { 
      name, 
      username, 
      password, 
      role, 
      phone, 
      email, 
      specialization, 
      code,
      is_role_specific 
    } = req.body;

    // Validation
    if (!name || !username || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, username, password, and role are required'
      });
    }

    const validRoles = ['ADMIN', 'DOCTOR', 'NURSE_RECEPTIONIST', 'PHARMACIST', 'CLERICAL_ASSISTANT', 'LAB_TECHNICIAN'];
    if (!validRoles.includes(role.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}`
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Role-specific validations
    if (role.toUpperCase() === 'DOCTOR') {
      if (!phone) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is required for doctors'
        });
      }
    }

    if (role.toUpperCase() === 'NURSE_RECEPTIONIST' || role.toUpperCase() === 'PHARMACIST') {
      if (!code) {
        return res.status(400).json({
          success: false,
          message: `Employee code is required for ${role.toLowerCase()}`
        });
      }
    }

    const user = await adminService.createUser({
      name,
      username,
      password,
      role,
      phone,
      email,
      specialization,
      code,
      is_role_specific: is_role_specific || false
    });

    res.status(201).json({
      success: true,
      message: `${role} created successfully`,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const { status, reason } = req.body;

    if (!status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Status is required' 
      });
    }

    const validStatuses = ['ACTIVE', 'INACTIVE'];
    if (!validStatuses.includes(status.toUpperCase())) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    const result = await adminService.updateUserStatus(user_id, status, reason);
    res.json({ 
      success: true, 
      message: 'User status updated successfully', 
      data: result 
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    // Prevent admin from deleting their own account
    if (req.user && req.user.user_id === user_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete your own account' 
      });
    }

    const result = await adminService.deleteUser(user_id);
    res.json({ 
      success: true, 
      message: 'User deleted successfully', 
      data: result 
    });
  } catch (err) {
    next(err);
  }
};

export const getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await adminService.getAllDoctors();
    res.json({ 
      success: true, 
      data: doctors, 
      count: doctors.length 
    });
  } catch (err) {
    next(err);
  }
};

export const getAllReceptionists = async (req, res, next) => {
  try {
    const receptionists = await adminService.getAllReceptionists();
    res.json({ 
      success: true, 
      data: receptionists, 
      count: receptionists.length 
    });
  } catch (err) {
    next(err);
  }
};

export const getAllNurses = async (req, res, next) => {
  try {
    const nurses = await adminService.getAllNurses();
    res.json({ 
      success: true, 
      data: nurses, 
      count: nurses.length 
    });
  } catch (err) {
    next(err);
  }
};

export const getAllPharmacists = async (req, res, next) => {
  try {
    const pharmacists = await adminService.getAllPharmacists();
    res.json({ 
      success: true, 
      data: pharmacists, 
      count: pharmacists.length 
    });
  } catch (err) {
    next(err);
  }
};

export const getAllVisits = async (req, res, next) => {
  try {
    const { date, status } = req.query;
    const visits = await adminService.getAllVisits({ date, status });
    res.json({ 
      success: true, 
      data: visits, 
      count: visits.length 
    });
  } catch (err) {
    next(err);
  }
};

export const getMedicineInventory = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const inventory = await adminService.getMedicineInventory({ status, search });
    res.json({ 
      success: true, 
      data: inventory, 
      count: inventory.length 
    });
  } catch (err) {
    next(err);
  }
};

export const getSystemLogs = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const logs = await adminService.getSystemLogs({
      startDate,
      endDate
    });

    res.json({
      success: true,
      data: logs,
      count: logs.length
    });
  } catch (err) {
    next(err);
  }
};

// Additional endpoints for better admin functionality

export const updateDoctor = async (req, res, next) => {
  try {
    const { doctor_id } = req.params;
    const { name, specialization, phone, availability_status } = req.body;

    // This would be implemented in the service
    res.status(501).json({
      success: false,
      message: 'Update doctor endpoint - to be implemented'
    });
  } catch (err) {
    next(err);
  }
};

export const updateStaff = async (req, res, next) => {
  try {
    const { staff_id } = req.params;
    const { name, phone, email, status } = req.body;

    // This would be implemented in the service
    res.status(501).json({
      success: false,
      message: 'Update staff endpoint - to be implemented'
    });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    
    // This would be implemented in the service
    res.status(501).json({
      success: false,
      message: 'Get user by ID endpoint - to be implemented'
    });
  } catch (err) {
    next(err);
  }
};

export const getInventoryStats = async (req, res, next) => {
  try {
    // Get comprehensive inventory statistics
    // This would be implemented in the service
    res.status(501).json({
      success: false,
      message: 'Inventory stats endpoint - to be implemented'
    });
  } catch (err) {
    next(err);
  }
};

export const getVisitStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Get visit statistics for dashboard
    // This would be implemented in the service
    res.status(501).json({
      success: false,
      message: 'Visit stats endpoint - to be implemented'
    });
  } catch (err) {
    next(err);
  }
};