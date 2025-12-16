const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const authenticate = require('./middlewares/auth.middleware');
const authorize = require('./middlewares/role.middleware');
const ROLES = require('./constants/roles');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

// Global middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Testing protected routes
app.get('/api/admin/protected', authenticate, authorize(ROLES.ADMIN), (req, res) => {
  res.json({ message: 'Admin access granted' });
});
app.get('/api/doctor/protected', authenticate, authorize(ROLES.DOCTOR), (req, res) => {
  res.json({ message: 'Doctor access granted' });
});
app.get('/api/receptionist/protected', authenticate, authorize(ROLES.RECEPTIONIST), (req, res) => {
  res.json({ message: 'Receptionist access granted' });
});
app.get('/api/nurse/protected', authenticate, authorize(ROLES.NURSE), (req, res) => {
  res.json({ message: 'Nurse access granted' });
});
app.get('/api/pharmacist/protected', authenticate, authorize(ROLES.PHARMACIST), (req, res) => {
  res.json({ message: 'Pharmacist access granted' });
});

// Error handling middleware
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});
app.use(errorHandler);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Healthcare backend running' });
});

module.exports = app;
