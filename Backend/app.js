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
import pharmacyRoutes from './routes/pharmacyRoutes.js';
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
  origin: 'http://localhost:5173', // adjust frontend URL
  credentials: true
}));

// CRITICAL: Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger - ADDED FOR DEBUGGING
app.use((req, res, next) => {
  console.log(`\n📥 [${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('📋 Headers:', {
    'content-type': req.headers['content-type'],
    'authorization': req.headers['authorization'] ? 'Bearer ***' : 'None'
  });
  
  // Only log body for POST/PUT/PATCH
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    console.log('📦 Body:', JSON.stringify(req.body, null, 2));
    console.log('📦 Body keys:', Object.keys(req.body || {}));
  }
  next();
});

// Specific debug middleware for nurse routes
app.use('/api/nurse', (req, res, next) => {
  console.log('🏥 [NURSE ROUTE] Intercepted');
  console.log('🏥 [NURSE ROUTE] Method:', req.method);
  console.log('🏥 [NURSE ROUTE] Path:', req.path);
  console.log('🏥 [NURSE ROUTE] Full URL:', req.originalUrl);
  
  if (req.method === 'POST' && req.path.includes('/complete')) {
    console.log('🏥 [COMPLETE TASK ROUTE] Body received:', req.body);
    console.log('🏥 [COMPLETE TASK ROUTE] secret_code:', req.body?.secret_code);
    console.log('🏥 [COMPLETE TASK ROUTE] observation:', req.body?.observation);
    console.log('🏥 [COMPLETE TASK ROUTE] remarks:', req.body?.remarks);
    console.log('🏥 [COMPLETE TASK ROUTE] medications_used:', req.body?.medications_used);
  }
  
  next();
});

// -------------------
// Routes
// -------------------
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/receptionist', receptionistRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/users', userRoutes);
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