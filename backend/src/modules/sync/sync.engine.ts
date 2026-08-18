import { prisma } from '../../database';
import axios from 'axios';

class SyncEngine {
  private isSyncing = false;
  private intervalId: NodeJS.Timeout | null = null;
  
  // Read dynamically at runtime to ensure dotenv has loaded
  private get cloudApiUrl() {
    return process.env.CLOUD_API_URL || 'https://api.omnitrack.com';
  }
  
  private get installationId() {
    return process.env.INSTALLATION_ID || 'INSTALLATION-LOCAL';
  }

  public start(intervalMs: number = 60000) {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    // Run immediately on start
    this.sync();
    
    // Then run on interval
    this.intervalId = setInterval(() => {
      this.sync();
    }, intervalMs);
    
    console.log(`[SYNC ENGINE] Started with interval ${intervalMs}ms`);
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[SYNC ENGINE] Stopped');
    }
  }

  public async sync() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      await this.pushChanges();
      // await this.pullChanges(); // Future implementation
    } catch (error) {
      console.error('[SYNC ENGINE] Sync failed:', error instanceof Error ? error.message : String(error));
    } finally {
      this.isSyncing = false;
    }
  }

  private async pushChanges() {
    // 1. Find all pending changes
    const pendingChanges = await prisma.syncChange.findMany({
      where: {
        status: { in: ['PENDING', 'FAILED'] }
      },
      orderBy: { created_at: 'asc' },
      take: 50 // Batch size
    });

    if (pendingChanges.length === 0) return;

    console.log(`[SYNC ENGINE] Pushing ${pendingChanges.length} changes to cloud...`);

    // Mark as syncing
    await prisma.syncChange.updateMany({
      where: { id: { in: pendingChanges.map(c => c.id) } },
      data: { status: 'SYNCING' }
    });

    try {
      // 2. We need to fetch the actual entity data for these changes
      const payloads = await Promise.all(pendingChanges.map(async (change) => {
        let entityData = null;
        
        // Dynamic fetch of the entity data (only needed for CREATE/UPDATE)
        if (change.operation !== 'DELETE') {
          // @ts-ignore - Dynamic access
          const modelDelegate = prisma[change.entity_type.charAt(0).toLowerCase() + change.entity_type.slice(1)];
          if (modelDelegate) {
            entityData = await modelDelegate.findUnique({ where: { id: change.entity_id } });
          }
        }

        return {
          changeId: change.id,
          businessId: change.business_id,
          entityType: change.entity_type,
          entityId: change.entity_id,
          operation: change.operation,
          deviceId: change.device_id,
          installationId: this.installationId,
          timestamp: change.created_at,
          data: entityData
        };
      }));

      // 3. Send to Cloud API (Mock implementation if CLOUD_API_URL is local or not set)
      if (this.cloudApiUrl === 'https://api.omnitrack.com' || process.env.MOCK_SYNC === 'true') {
        console.log(`[SYNC ENGINE] Mock mode: Successfully synced ${payloads.length} changes`);
        await this.markAsSynced(pendingChanges.map(c => c.id));
      } else {
        // Real HTTP request to cloud
        const response = await axios.post(`${this.cloudApiUrl}/api/sync/push`, {
          installationId: this.installationId,
          changes: payloads
        }, {
          headers: {
            'Authorization': `Bearer ${process.env.SYNC_SECRET || 'secret'}`
          }
        });

        if (response.data.success && response.data.processed) {
          await this.markAsSynced(response.data.processed);
          
          if (response.data.errors && response.data.errors.length > 0) {
            console.error('[SYNC ENGINE] Some items failed on cloud:', response.data.errors);
            const failedIds = response.data.errors.map((e: any) => e.changeId);
            await prisma.syncChange.updateMany({
              where: { id: { in: failedIds } },
              data: { 
                status: 'FAILED',
                retry_count: { increment: 1 } 
              }
            });
          }
        } else {
          throw new Error('Cloud API returned failure status');
        }
      }
    } catch (error: any) {
      console.error(`[SYNC ENGINE] Push failed:`, error.message);
      
      // Mark as failed and increment retry
      for (const change of pendingChanges) {
        await prisma.syncChange.update({
          where: { id: change.id },
          data: {
            status: 'FAILED',
            last_error: error.message || 'Unknown error',
            retry_count: { increment: 1 }
          }
        });
      }
    }
  }

  private async markAsSynced(changeIds: string[]) {
    await prisma.syncChange.updateMany({
      where: { id: { in: changeIds } },
      data: {
        status: 'SYNCED',
        processed_at: new Date()
      }
    });
  }

  // Gets the current sync status for UI
  public async getStatus() {
    const pendingCount = await prisma.syncChange.count({ where: { status: 'PENDING' } });
    const failedCount = await prisma.syncChange.count({ where: { status: 'FAILED' } });
    const syncingCount = await prisma.syncChange.count({ where: { status: 'SYNCING' } });
    
    const lastSuccess = await prisma.syncChange.findFirst({
      where: { status: 'SYNCED' },
      orderBy: { processed_at: 'desc' }
    });

    let statusStr = 'ONLINE';
    if (this.isSyncing || syncingCount > 0) statusStr = 'SYNCING';
    else if (failedCount > 0) statusStr = 'ERROR';
    else if (pendingCount > 0) statusStr = 'PENDING';
    else statusStr = 'SYNCED';

    let isOnline = false;
    try {
      if (this.cloudApiUrl === 'https://api.omnitrack.com' || process.env.MOCK_SYNC === 'true') {
        isOnline = true;
      } else {
        // Fast check to see if cloud is reachable
        await axios.get(`${this.cloudApiUrl}/api/health`, { timeout: 2000 });
        isOnline = true;
      }
    } catch (e) {
      isOnline = false;
    }

    return {
      status: statusStr,
      pendingCount,
      failedCount,
      lastSync: lastSuccess?.processed_at || null,
      installationId: this.installationId,
      deviceId: process.env.DEVICE_ID || 'SERVER-MAIN',
      isOnline
    };
  }
}

export const syncEngine = new SyncEngine();
