import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import licenseRoutes from './modules/license/license.routes';
import businessRoutes from './modules/business/business.routes';
import authRoutes from './modules/auth/auth.routes';
import employeeRoutes from './modules/employees/employee.routes';
import categoryRoutes from './modules/products/category.routes';
import productRoutes from './modules/products/product.routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/license', licenseRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

// Basic health check route to verify connection
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running and connected successfully!' });
});

export default app;
