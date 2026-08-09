import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, ChefHat, CheckCircle2, Clock, Image as ImageIcon, QrCode } from 'lucide-react';
import QRCode from 'react-qr-code';

export default function KitchenDashboardPage() {
  const { currentUser } = useAppStore();
  const businessId = currentUser?.business_id;

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [lanUrl, setLanUrl] = useState(`http://${window.location.hostname}:5173/kitchen?business_id=${businessId}`);

  useEffect(() => {
    if (!businessId) return;
    const loc = window.location;
    if (loc.hostname !== 'localhost' && loc.hostname !== '127.0.0.1') {
      setLanUrl(`${loc.protocol}//${loc.hostname}:${loc.port}/kitchen?business_id=${businessId}`);
    } else {
      fetch('/api/network-info').then(r => r.json()).then(data => {
        if (data.ip) {
          setLanUrl(`${loc.protocol}//${data.ip}:${loc.port}/kitchen?business_id=${businessId}`);
        }
      }).catch(err => console.error(err));
    }
  }, [businessId]);

  const fetchKitchenOrders = async (silent = false) => {
    if (!businessId) return;
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`/api/orders?business_id=${businessId}`);
      const data = await res.json();
      
      let oItems = [];
      if (Array.isArray(data)) oItems = data;
      else if (data && Array.isArray(data.data)) oItems = data.data;

      const kitchenOrders = oItems.filter((o: any) => o.status === 'Pending' || o.status === 'Preparing');
      kitchenOrders.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      setOrders(kitchenOrders);
      setError(null);
    } catch (e) {
      console.error(e);
      if (!silent) setError("Failed to load kitchen orders");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (businessId) fetchKitchenOrders();
  }, [businessId]);

  useEffect(() => {
    if (!businessId) return;
    const intervalId = setInterval(() => {
      fetchKitchenOrders(true);
    }, 5000);
    return () => clearInterval(intervalId);
  }, [businessId]);

  const handleServe = async (orderId: string) => {
    setProcessingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Ready' })
      });
      if (res.ok) {
        setSuccessMsg("Order marked as Ready!");
        setTimeout(() => setSuccessMsg(null), 3000);
        await fetchKitchenOrders(true);
      } else {
        throw new Error('Failed to update');
      }
    } catch (e) {
      setError("Failed to mark order as Ready");
      setTimeout(() => setError(null), 3000);
    } finally {
      setProcessingId(null);
    }
  };

  const getElapsedTime = (createdAt: string) => {
    const ms = new Date().getTime() - new Date(createdAt).getTime();
    const mins = Math.floor(ms / 60000);
    if (mins < 1) return 'Just now';
    return `${mins} min ago`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground animate-pulse">Loading Kitchen Display...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {successMsg && (
        <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 animate-in slide-in-from-top-5">
          <div className="px-4 py-3 rounded-xl shadow-lg font-medium text-sm flex items-center bg-emerald-600 text-white">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            {successMsg}
          </div>
        </div>
      )}
      {error && orders.length > 0 && (
        <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 animate-in slide-in-from-top-5">
          <div className="px-4 py-3 rounded-xl shadow-lg font-medium text-sm flex items-center bg-destructive text-destructive-foreground">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            {error}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ChefHat className="w-8 h-8 text-primary" />
            Kitchen Display System
          </h1>
          <p className="text-muted-foreground mt-1">Manage and track ongoing kitchen orders</p>
        </div>
        <Button onClick={() => setShowQR(true)} variant="outline" className="gap-2">
          <QrCode className="w-4 h-4" />
          Kitchen QR Code
        </Button>
      </div>

      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Kitchen App Access</DialogTitle>
            <DialogDescription>
              Scan this QR code with a tablet or mobile device connected to the same Wi-Fi network to open the standalone kitchen app.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <QRCode value={lanUrl} size={200} />
            </div>
            <div className="w-full">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Direct URL</p>
              <div className="bg-muted p-2 rounded text-sm text-center break-all font-mono">
                {lanUrl}
              </div>
            </div>
            <Button className="w-full" onClick={() => window.open(lanUrl, '_blank')}>
              Open in New Tab
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {error && orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center">
            <ChefHat className="w-12 h-12 text-destructive mb-4" />
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => fetchKitchenOrders()}>Retry</Button>
          </CardContent>
        </Card>
      ) : orders.length === 0 ? (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center min-h-[400px]">
            <ChefHat className="w-20 h-20 mb-4 text-muted-foreground/30" />
            <p className="text-2xl font-bold text-muted-foreground/50">No pending orders</p>
            <p className="text-sm text-muted-foreground mt-2">New orders will appear here automatically</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => {
            const tableNum = order.table?.table_number || order.table_id || 'Walk-in';
            const isProcessing = processingId === order.id;

            return (
              <Card key={order.id} className={`flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 shadow-md ${order.status === 'Preparing' ? 'border-amber-500/50' : 'border-primary/20'}`}>
                <div className={`p-4 border-b flex justify-between items-center ${order.status === 'Preparing' ? 'bg-amber-500/10' : 'bg-primary/5'}`}>
                  <div>
                    <h3 className="font-bold text-xl">Table {tableNum}</h3>
                    <div className="flex items-center text-xs font-semibold text-muted-foreground mt-1 gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {getElapsedTime(order.created_at)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      order.status === 'Preparing' ? 'bg-amber-500 text-white' : 'bg-primary text-primary-foreground'
                    }`}>
                      {order.status}
                    </span>
                    <div className="text-[10px] text-muted-foreground mt-1 font-mono">#{order.id.slice(0, 8)}</div>
                  </div>
                </div>

                <div className="p-0 flex-1 bg-card">
                  <ul className="divide-y divide-border/50">
                    {order.items?.map((item: any, idx: number) => {
                      const imageSrc = (item.product?.image_url || item.product?.imageUrl)?.replace(/^https?:\/\/[^\/]+(\/uploads\/)/, '$1');
                      return (
                        <li key={idx} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors group">
                          <div className="flex items-center gap-5">
                            <div className="w-24 h-24 rounded-xl bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 border border-border/50 shadow-md">
                              {imageSrc ? (
                                <img src={imageSrc} alt={item.product?.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              ) : (
                                <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                              )}
                            </div>
                            <div>
                              <span className="font-black text-foreground text-xl block leading-tight">{item.product?.name || 'Unknown Product'}</span>
                              <span className="text-sm font-bold text-primary block mt-1.5 uppercase tracking-wide">Qty: {item.quantity}</span>
                            </div>
                          </div>
                          <span className="font-black text-4xl w-12 text-center flex-shrink-0 text-primary">{item.quantity}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="p-4 border-t bg-muted/20 mt-auto">
                  {order.notes && (
                    <div className="mb-4 text-sm bg-amber-500/10 text-amber-800 dark:text-amber-300 p-3 rounded-lg border border-amber-500/30 font-medium">
                      <span className="font-bold uppercase text-[10px] tracking-wider block mb-1 opacity-80">Special Instructions</span>
                      {order.notes}
                    </div>
                  )}
                  <Button 
                    className="w-full py-6 text-lg font-bold shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 text-white border-0 transition-all active:scale-[0.98]"
                    onClick={() => handleServe(order.id)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-6 h-6" />
                        Mark Ready to Serve
                      </span>
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
