import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cloud, CloudOff, RefreshCw, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function SyncBackupPage() {
  const { businessSettings } = useAppStore();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await axios.get('/api/sync/status');
      if (res.data.success) {
        setStatus(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch sync status', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSyncNow = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      await axios.post('/api/sync/now');
      await fetchStatus();
    } catch (err) {
      console.error('Failed to trigger sync', err);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isSynced = status?.status === 'SYNCED';
  const isSyncing = status?.status === 'SYNCING' || syncing;
  const isError = status?.status === 'ERROR';

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Synchronization & Backup</h1>
        <p className="text-muted-foreground mt-1">Manage cloud synchronization for offline-first architecture.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-primary" /> Cloud Connection
            </CardTitle>
            <CardDescription>Current status of your connection to the central database.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={`p-4 rounded-xl border flex items-start gap-4 ${
              isError ? 'bg-destructive/10 border-destructive/20' :
              isSynced ? 'bg-emerald-500/10 border-emerald-500/20' :
              'bg-blue-500/10 border-blue-500/20'
            }`}>
              {isError ? (
                <AlertCircle className="w-8 h-8 text-destructive shrink-0" />
              ) : isSynced ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
              ) : (
                <RefreshCw className={`w-8 h-8 text-blue-600 shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
              )}
              
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {isError ? 'Synchronization Issue' :
                   isSyncing ? 'Synchronizing Data...' :
                   'All Data Synced'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {isError ? 'Some local changes could not be saved to the cloud. The system will retry automatically.' :
                   isSyncing ? 'Currently uploading local changes to the cloud database.' :
                   'Your local data is perfectly aligned with the cloud.'}
                </p>
              </div>
              
              <Button 
                variant={isError ? "destructive" : "default"} 
                onClick={handleSyncNow}
                disabled={isSyncing}
              >
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Status</p>
                <p className="font-medium flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${status?.isOnline ? 'bg-emerald-500' : 'bg-destructive'}`}></span>
                  {status?.isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Pending</p>
                <p className="font-medium">{status?.pendingCount || 0} items</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Failed</p>
                <p className={`font-medium ${status?.failedCount > 0 ? 'text-destructive' : ''}`}>{status?.failedCount || 0} items</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Last Sync</p>
                <p className="font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  {status?.lastSync ? new Date(status.lastSync).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Never'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>Device and installation details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Installation ID</p>
              <p className="font-mono text-xs bg-muted p-2 rounded truncate" title={status?.installationId}>
                {status?.installationId || 'Not registered'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Device ID</p>
              <p className="font-mono text-xs bg-muted p-2 rounded truncate" title={status?.deviceId}>
                {status?.deviceId || 'Unknown'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Business Name</p>
              <p className="text-sm font-medium">{businessSettings?.name || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How offline-first works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-4">
          <p>
            This system is designed as an <strong>offline-first</strong> platform. This means all your daily operations—creating orders, processing sales, managing inventory—are saved instantly to the local server in your restaurant.
          </p>
          <p>
            When an internet connection is available, the background <strong>Sync Engine</strong> automatically pushes these local changes to your secure Cloud Database. If the internet drops, you can continue working without any interruption. Once reconnected, the system will seamlessly catch up.
          </p>
          <p>
            You do not need to click "Sync Now" for normal operations. The system synchronizes automatically every minute while online.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
