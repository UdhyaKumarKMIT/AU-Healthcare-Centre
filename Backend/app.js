import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import receptionistRoutes from './routes/receptionist.routes.js';
import doctorRoutes from './routes/doctor.route.js';
import pharmacyRoutes from './routes/pharmacist.routes.js';
import CARoutes from './routes/clericalAssistant.routes.js';
import studentRoutes from './routes/student.routes.js';
import userRoutes from './routes/user.routes.js';
import staffRoutes from './routes/staff.routes.js';
import nurseRoutes from './routes/nurse.routes.js';
import labtechRoutes from './routes/labtech.routes.js';

// Middleware
import errorHandler from './middlewares/error.middleware.js';

const app = express();

// -------------------
// Swagger Setup
// -------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let swaggerDocument;
try {
  swaggerDocument = JSON.parse(readFileSync(path.join(__dirname, 'docs', 'api.json'), 'utf-8'));
} catch (err) {
  console.warn('Swagger doc not found or invalid JSON. Skipping Swagger setup.');
  swaggerDocument = null;
}

if (swaggerDocument) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// -------------------
// Global Middlewares
// -------------------
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// CRITICAL: Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// -------------------
// Routes
// -------------------
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/receptionist', receptionistRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/pharmacy', pharmacyRoutes); // pharmacist-specific routes
app.use('/api/clerical_assistant', CARoutes); // clerical assistant
app.use('/api/students', studentRoutes); // student-specific routes
app.use('/api/users', userRoutes); // user management (admin)
app.use('/api/nurse', nurseRoutes);
app.use('/api/labtech', labtechRoutes);
app.use('/api/admin/staff', staffRoutes);

// -------------------
// Health check
// -------------------
app.get('/', (req, res) => res.send('API running'));
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Healthcare backend running' }));

// -------------------
// 404 Handler
// -------------------
app.use((req, res, next) => {
  console.log('❌ 404 - Route not found:', req.method, req.url);
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// -------------------
// Global Error Handler
// -------------------
app.use(errorHandler);

export default app;