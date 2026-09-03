import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, Image as ImageIcon, Loader2, ChefHat } from 'lucide-react';
import { getImageUrl } from '@/utils/image';
import { apiFetch } from '@/lib/api';

export default function KitchenAppPage() {
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get('business_id');

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchKitchenOrders = async (silent = false) => {
    if (!businessId) return;
    if (!silent) setLoading(true);
    try {
      const res = await apiFetch(`/api/orders?business_id=${businessId}`);
      const data = await res.json();
      
      let oItems = [];
      if (Array.isArray(data)) oItems = data;
      else if (data && Array.isArray(data.data)) oItems = data.data;

      // Filter to only show active kitchen orders (Pending, Preparing)
      const kitchenOrders = oItems.filter((o: any) => o.status === 'Pending' || o.status === 'Preparing');
      
      // Sort by time: oldest first
      kitchenOrders.sort((a: any, b: any) => {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });

      setOrders(kitchenOrders);
      setError(null);
    } catch (e) {
      console.error(e);
      if (!silent) setError("Failed to load orders");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (businessId) {
      fetchKitchenOrders();
    } else {
      setError("Invalid QR Code. Missing business ID.");
      setLoading(false);
    }
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
      const res = await apiFetch(`/api/orders/${orderId}`, {
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
      <div className="min-h-screen bg-background p-6 space-y-6">
        <div className="flex justify-between items-center"><Skeleton className="h-10 w-[200px]" /><Skeleton className="h-10 w-[150px]" /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({length: 8}).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-4">
          <ChefHat className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Top Fixed Toast Notifications */}
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

      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b px-4 py-3 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-sm">
            <ChefHat className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold">Kitchen Display</h1>
        </div>
        <div className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Live
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 bg-muted/30">
        {orders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-50 mt-20">
            <ChefHat className="w-20 h-20 mb-4 text-muted-foreground" />
            <p className="text-xl font-semibold">No pending orders</p>
            <p className="text-sm">New orders will appear here automatically</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((order) => {
              const tableNum = order.table?.table_number || order.table_id || 'Walk-in';
              const isProcessing = processingId === order.id;

              return (
                <div key={order.id} className="bg-card border rounded-xl shadow-sm flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  {/* Card Header */}
                  <div className={`p-4 border-b flex justify-between items-center ${order.status === 'Preparing' ? 'bg-amber-500/10' : ''}`}>
                    <div>
                      <h3 className="font-bold text-lg">Table {tableNum}</h3>
                      <div className="flex items-center text-xs text-muted-foreground mt-1 gap-1">
                        <Clock className="w-3 h-3" />
                        {getElapsedTime(order.created_at)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                        order.status === 'Preparing' ? 'bg-amber-500/20 text-amber-600' : 'bg-primary/20 text-primary'
                      }`}>
                        {order.status}
                      </span>
                      <div className="text-xs text-muted-foreground mt-1">Order #{order.id.slice(0, 5)}</div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-0 flex-1 bg-muted/10">
                    <ul className="divide-y">
                      {order.items?.map((item: any, idx: number) => {
                        const imageSrc = getImageUrl(item.product?.image_url || item.product?.imageUrl);
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
                              <span className="font-bold text-foreground text-base block">{item.product?.name || 'Unknown Product'}</span>
                              <span className="text-xs font-semibold text-primary block mt-0.5">Qty: {item.quantity}</span>
                            </div>
                          </div>
                          <span className="font-black text-2xl w-8 text-center flex-shrink-0 text-foreground/80">{item.quantity}</span>
                        </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Card Footer / Action */}
                  <div className="p-4 border-t bg-card mt-auto">
                    {order.notes && (
                      <div className="mb-4 text-sm bg-amber-500/10 text-amber-700 p-3 rounded-lg border border-amber-500/20">
                        <span className="font-bold block mb-1">Notes:</span>
                        {order.notes}
                      </div>
                    )}
                    <Button 
                      className="w-full py-6 text-lg font-bold shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                      onClick={() => handleServe(order.id)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5" />
                          Mark Ready to Serve
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
