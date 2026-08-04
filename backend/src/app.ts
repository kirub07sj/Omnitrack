import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import licenseRoutes from './modules/license/license.routes';
import businessRoutes from './modules/business/business.routes';
import authRoutes from './modules/auth/auth.routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/license', licenseRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/auth', authRoutes);

// Basic health check route to verify connection
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running and connected successfully!' });
});

export default app;
