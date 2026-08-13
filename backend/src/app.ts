import express from 'express';
import path from 'path';
import os from 'os';
import cors from 'cors';
import dotenv from 'dotenv';
import licenseRoutes from './modules/license/license.routes';
import businessRoutes from './modules/business/business.routes';
import authRoutes from './modules/auth/auth.routes';
import employeeRoutes from './modules/employees/employee.routes';
import categoryRoutes from './modules/products/category.routes';
import productRoutes from './modules/products/product.routes';
import uploadRoutes from './modules/upload/upload.routes';
import inventoryRoutes from './modules/inventory/inventory.routes';
import supplierRoutes from './modules/inventory/supplier.routes';
import purchaseRoutes from './modules/inventory/purchase.routes';
import orderRoutes from './modules/orders/order.routes';
import tableRoutes from './modules/tables/table.routes';
import salesRoutes from './modules/sales/sales.routes';
import transactionsRoutes from './modules/transactions/transactions.routes';
import expenseRoutes from './modules/expenses/expense.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import reportsRoutes from './modules/reports/reports.routes';
import syncRoutes from './modules/sync/sync.routes';

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
app.use('/api/inventory', inventoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/sync', syncRoutes);

// Serve static uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Basic health check route to verify connection
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running and connected successfully!' });
});

// Return machine's LAN IP so the QR code can point to it instead of localhost
app.get('/api/network-info', (req, res) => {
  const interfaces = os.networkInterfaces();
  let ip = '127.0.0.1';
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ip = iface.address;
        break;
      }
    }
    if (ip !== '127.0.0.1') break;
  }
  res.json({ ip });
});

export default app;
