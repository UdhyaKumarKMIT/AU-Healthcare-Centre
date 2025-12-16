import express from 'express';
const router = express.Router();
import authenticate from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/role.middleware.js';
import ROLES from '../constants/roles.js';
import * as adminController from '../controllers/admin.controller.js';

// Register Route - Only accessible by ADMIN
router.post('/users', authenticate, authorize(ROLES.ADMIN), adminController.createUser);

export default router;