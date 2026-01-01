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
    const { name, email, password, role, phone, specialization, qualification, register_number } = req.body;
    
    if (!name || !email || !password || !role) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, password, and role are required' 
      });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format' 
      });
    }
    
    const validRoles = ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PHARMACIST'];
    if (!validRoles.includes(role.toUpperCase())) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid role. Must be one of: ADMIN, DOCTOR, NURSE, RECEPTIONIST, PHARMACIST' 
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters' 
      });
    }
    
    if (role.toUpperCase() === 'DOCTOR') {
      if (!specialization) {
        return res.status(400).json({ 
          success: false, 
          message: 'Specialization is required for doctors' 
        });
      }
      if (!phone) {
        return res.status(400).json({ 
          success: false, 
          message: 'Phone number is required for doctors' 
        });
      }
    }

    if (role.toUpperCase() === 'NURSE') {
      if (!qualification) {
        return res.status(400).json({ 
          success: false, 
          message: 'Qualification is required for nurses' 
        });
      }
      if (!register_number) {
        return res.status(400).json({ 
          success: false, 
          message: 'Register number is required for nurses' 
        });
      }
    }
    
    const user = await adminService.createUser({
      name,
      email,
      password,
      role,
      phone,
      specialization,
      qualification,
      register_number
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
      return res.status(400).json({ success: false, message: 'Status required' });
    }

    const validStatuses = ['active', 'inactive', 'suspended', 'pending'];
    if (!validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    if (status.toLowerCase() === 'suspended' && !reason) {
      return res.status(400).json({ success: false, message: 'Reason required for suspension' });
    }

    const result = await adminService.updateUserStatus(user_id, status, reason);
    res.json({ success: true, message: 'Status updated', data: result });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    if (req.user && req.user.user_id === user_id) {
      return res.status(400).json({ success: false, message: 'Cannot delete own account' });
    }

    const result = await adminService.deleteUser(user_id);
    res.json({ success: true, message: 'User deleted', data: result });
  } catch (err) {
    next(err);
  }
};

export const getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await adminService.getAllDoctors();
    res.json({ success: true, data: doctors, count: doctors.length });
  } catch (err) {
    next(err);
  }
};

export const getAllReceptionists = async (req, res, next) => {
  try {
    const receptionists = await adminService.getAllReceptionists();
    res.json({ success: true, data: receptionists, count: receptionists.length });
  } catch (err) {
    next(err);
  }
};

export const getAllNurses = async (req, res, next) => {
  try {
    const nurses = await adminService.getAllNurses();
    res.json({ success: true, data: nurses, count: nurses.length });
  } catch (err) {
    next(err);
  }
};

export const getAllPharmacists = async (req, res, next) => {
  try {
    const pharmacists = await adminService.getAllPharmacists();
    res.json({ success: true, data: pharmacists, count: pharmacists.length });
  } catch (err) {
    next(err);
  }
};

export const getAllVisits = async (req, res, next) => {
  try {
    const { date, status } = req.query;
    const visits = await adminService.getAllVisits({ date, status });
    res.json({ success: true, data: visits, count: visits.length });
  } catch (err) {
    next(err);
  }
};

export const getMedicineInventory = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const inventory = await adminService.getMedicineInventory({ status, search });
    res.json({ success: true, data: inventory, count: inventory.length });
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

