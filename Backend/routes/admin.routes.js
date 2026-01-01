// src/routes/admin.routes.js
import express from 'express';
import authenticate from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/role.middleware.js';
import * as adminController from '../controllers/admin.controller.js';
import ROLES from '../constants/roles.js';

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

// Dashboard Stats
router.get('/stats', adminController.getAdminStats);
router.get('/patient-overview', adminController.getPatientOverview);

// User Management
router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.patch('/users/:user_id/status', adminController.updateUserStatus);
router.delete('/users/:user_id', adminController.deleteUser);

// Staff Management
router.get('/doctors', adminController.getAllDoctors);
router.get('/receptionists', adminController.getAllReceptionists);
router.get('/nurses', adminController.getAllNurses);
router.get('/pharmacists', adminController.getAllPharmacists);

// Visit Management
router.get('/visits', adminController.getAllVisits);

// Inventory Management
router.get('/inventory', adminController.getMedicineInventory);

// System Logs
router.get('/logs', adminController.getSystemLogs);

export default router;