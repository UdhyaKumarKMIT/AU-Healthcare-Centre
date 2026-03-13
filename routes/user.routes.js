import express from 'express';
import authenticate from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/role.middleware.js';
import ROLES from '../constants/roles.js';
import * as controller from '../controllers/user.controller.js';

const router = express.Router();

// Create user (admin only)
router.post('/', controller.createUser);

// List users (admin only)
router.get('/', controller.getUsers);

// Get single user
router.get('/:id', controller.getUserById);

// Update user
router.put('/:id', controller.updateUser);

// Delete user
router.delete('/:id', controller.deleteUser);

export default router;
