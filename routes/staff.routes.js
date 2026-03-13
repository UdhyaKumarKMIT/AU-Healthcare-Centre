import express from 'express';
import authenticate from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/role.middleware.js';
import ROLES from '../constants/roles.js';
import * as controller from '../controllers/staff.controller.js';

const router = express.Router();

// Admin-only access for all staff routes
router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

// Create staff record
router.post('/', controller.createStaff);

// List staff with optional filters
router.get('/', controller.getStaff);

// Get single staff by ID
router.get('/:staff_id', controller.getStaffById);

// Update staff
router.put('/:staff_id', controller.updateStaff);

// Delete staff
router.delete('/:staff_id', controller.deleteStaff);

export default router;
