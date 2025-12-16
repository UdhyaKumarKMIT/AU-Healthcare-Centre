import express from 'express';
const router = express.Router();
import * as authController from '../controllers/auth.controller.js';

// Login route
router.post('/login', authController.login);

export default router;