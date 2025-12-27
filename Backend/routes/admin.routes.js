// src/routes/admin.routes.js
import express from 'express';
import authenticate from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/role.middleware.js';
import * as adminController from '../controllers/admin.controller.js';
import ROLES from '../constants/roles.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

router.get('/stats', adminController.getAdminStats);
router.get('/patient-overview', adminController.getPatientOverview);
router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.patch('/users/:user_id/status', adminController.updateUserStatus);
router.delete('/users/:user_id', adminController.deleteUser);
router.get('/doctors', adminController.getAllDoctors);
router.get('/receptionists', adminController.getAllReceptionists);
router.get('/visits', adminController.getAllVisits);

export default router;