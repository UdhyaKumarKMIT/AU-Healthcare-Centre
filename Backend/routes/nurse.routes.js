import express from 'express';
import authenticate from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/role.middleware.js';
import * as nurseController from '../controllers/nurse.controller.js';
import ROLES from '../constants/roles.js';

const router = express.Router();

// Add detailed logging middleware for ALL requests
router.use((req, res, next) => {
  console.log('🏥 [NURSE ROUTE] ===== REQUEST START =====');
  console.log('🏥 [NURSE ROUTE] Method:', req.method);
  console.log('🏥 [NURSE ROUTE] Path:', req.path);
  console.log('🏥 [NURSE ROUTE] URL:', req.url);
  console.log('🏥 [NURSE ROUTE] Body:', req.body);
  console.log('🏥 [NURSE ROUTE] Body type:', typeof req.body);
  console.log('🏥 [NURSE ROUTE] Body keys:', Object.keys(req.body || {}));
  
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('🏥 [NURSE ROUTE] POST/PUT Data:');
    console.log('  - observation:', req.body?.observation);
    console.log('  - remarks:', req.body?.remarks);
    console.log('  - secret_code:', req.body?.secret_code);
    console.log('  - medications_used:', req.body?.medications_used);
  }
  console.log('🏥 [NURSE ROUTE] ===== REQUEST END =====');
  next();
});

// All routes require authentication and NURSE_RECEPTIONIST role
router.use(authenticate);
router.use(authorize(ROLES.NURSE_RECEPTIONIST));

// Get nurse tasks
router.get('/tasks', nurseController.getNurseTasks);

// Get task details
router.get('/task/:task_id/details', nurseController.getTaskDetails);

// Get completed task details
router.get('/task/:task_id/completed-details', nurseController.getCompletedTaskDetails);

// Complete task
router.post('/task/:task_id/complete', nurseController.completeTask);

// Get available stock
router.get('/stock', nurseController.getAvailableStock);

// Verify secret code
router.post('/verify-code', nurseController.verifySecretCode);

export default router;