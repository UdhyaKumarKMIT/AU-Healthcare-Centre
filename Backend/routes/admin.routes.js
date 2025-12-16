const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const ROLES = require('../constants/roles');
const adminController = require('../controllers/admin.controller'); 

// Register Route - Only accessible by ADMIN
router.post('/users', authenticate, authorize(ROLES.ADMIN), adminController.createUser);

module.exports = router;