import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import { authMiddleware } from './middleware/auth.middleware';
import { subscriptionMiddleware } from './middleware/subscription.middleware';
import { prisma } from './config/database';

import accountRoutes from './modules/account/account.routes';
import subscriptionRoutes from './modules/subscription/subscription.routes';
import authRoutes from './modules/auth/auth.routes';
import businessRoutes from './modules/business/business.routes';
import employeeRoutes from './modules/employees/employee.routes';
import categoryRoutes from './modules/products/category.routes';
import productRoutes from './modules/products/product.routes';
import inventoryRoutes from './modules/inventory/inventory.routes';
import supplierRoutes from './modules/inventory/supplier.routes';
import purchaseRoutes from './modules/inventory/purchase.routes';
import orderRoutes from './modules/orders/order.routes';
import salesRoutes from './modules/sales/sales.routes';
import tableRoutes from './modules/tables/table.routes';
import expenseRoutes from './modules/expenses/expense.routes';
import transactionRoutes from './modules/transactions/transactions.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import reportRoutes from './modules/reports/reports.routes';
import uploadRoutes from './modules/upload/upload.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

const corsOptions = {
  origin: process.env.FRONTEND_URL || '*', // Restrict this in Vercel settings!
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// 1. Health check
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected (Neon)' });
  } catch (error) {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

// 2. Sync Push (Retained from original)
app.post('/api/sync/push', async (req, res) => {
  const { installationId, changes } = req.body;
  if (!installationId || !changes || !Array.isArray(changes)) {
    res.status(400).json({ success: false, message: 'Invalid payload' });
    return;
  }

  console.log(`[CLOUD API] Received ${changes.length} changes from installation: ${installationId}`);
  
  const processedIds: string[] = [];
  const errors: { changeId: string; error: string }[] = [];

  for (const change of changes) {
    try {
      const existingChange = await prisma.syncChange.findUnique({
        where: { id: change.changeId }
      });

      if (existingChange) {
        processedIds.push(change.changeId);
        continue;
      }

      const modelName = change.entityType.charAt(0).toLowerCase() + change.entityType.slice(1);
      const modelDelegate = (prisma as any)[modelName];

      if (modelDelegate) {
        if (change.operation === 'DELETE') {
          try {
            await modelDelegate.delete({ where: { id: change.entityId } });
          } catch (e: any) {
            if (e.code !== 'P2025') throw e;
          }
        } else if (change.data) {
          await modelDelegate.upsert({
            where: { id: change.entityId },
            create: change.data,
            update: change.data
          });
        }
      }

      await prisma.syncChange.create({
        data: {
          id: change.changeId,
          business_id: change.businessId,
          entity_type: change.entityType,
          entity_id: change.entityId,
          operation: change.operation,
          device_id: change.deviceId,
          installation_id: change.installationId,
          status: 'SYNCED',
          processed_at: new Date()
        }
      });

      processedIds.push(change.changeId);
    } catch (error: any) {
      console.error(`Failed to process change ${change.changeId}:`, error.message);
      errors.push({ changeId: change.changeId, error: error.message });
    }
  }

  res.json({
    success: true,
    processed: processedIds,
    errors
  });
});

// 3. Public Routes (No Auth)
app.use('/api/account', accountRoutes);

// 4. Protected Routes
// Apply global auth middleware
app.use('/api', authMiddleware);

// Auth & Setup (Subscription check not needed here, they might not have a business yet)
app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/subscription', subscriptionRoutes);

// Apply subscription check middleware for business endpoints
app.use('/api', subscriptionMiddleware);

// 5. Business Operations
app.use('/api/employees', employeeRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/upload', uploadRoutes);

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Cloud Backend running on port ${PORT}`);
  });
}

export default app;
