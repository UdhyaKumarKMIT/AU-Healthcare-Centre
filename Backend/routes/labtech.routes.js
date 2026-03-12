// src/routes/labtech.routes.js
import express from 'express';
import authenticate from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/role.middleware.js';
import * as labTechController from '../controllers/labtech.controller.js';
import ROLES from '../constants/roles.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Lab technician routes - require LAB_TECHNICIAN role
router.use(authorize(ROLES.LAB_TECHNICIAN));

// Dashboard statistics
router.get('/stats', labTechController.getLabTechStats);

// Lab tests management
router.get('/tests', labTechController.getAllLabTests);
router.get('/tests/:test_id', labTechController.getLabTestById);
router.post('/tests/:test_id/results', labTechController.submitTestResults);

// Stock (verified) + verification
router.get('/stock', labTechController.getAvailableStock);
router.get('/stock/pending', labTechController.getPendingVerificationStock);
router.post('/stock/verify', labTechController.verifyStock);

// Lab technicians list (for admin)
router.get('/technicians', labTechController.getAllLabTechnicians);

export default router;