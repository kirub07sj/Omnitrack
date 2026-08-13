import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'connected (Neon)' });
});

// The core endpoint for offline-first sync
app.post('/api/sync/push', async (req, res) => {
  const { installationId, changes } = req.body;
  
  if (!installationId || !changes || !Array.isArray(changes)) {
    return res.status(400).json({ success: false, message: 'Invalid payload' });
  }

  console.log(`[CLOUD API] Received ${changes.length} changes from installation: ${installationId}`);
  
  const processedIds = [];
  const errors = [];

  for (const change of changes) {
    try {
      // Very basic idempotency check: did we already process this exact change event?
      const existingChange = await prisma.syncChange.findUnique({
        where: { id: change.changeId }
      });

      if (existingChange) {
        // Already processed, mark success and skip
        processedIds.push(change.changeId);
        continue;
      }

      // 1. Replicate the actual data into the Neon PostgreSQL database FIRST
      // This prevents foreign key errors when creating the sync_change audit log (e.g. if the change IS the Business)
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

      // 2. Record the change in the cloud's sync_change log for audit
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

  // Return exactly which changes succeeded so the local system can mark them as SYNCED
  res.json({
    success: true,
    processed: processedIds,
    errors
  });
});

app.listen(PORT, () => {
  console.log(`Cloud Sync Backend running on port ${PORT}`);
});
