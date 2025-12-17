import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import errorHandler from './middlewares/error.middleware.js';
import swaggerUi from 'swagger-ui-express';
import {readFileSync} from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const app = express();

// Swagger setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerDocument = JSON.parse(readFileSync(path.join(__dirname, 'docs', 'api.json'), 'utf-8'));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Global middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

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

export default app;
