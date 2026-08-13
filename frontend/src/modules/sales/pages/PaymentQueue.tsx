import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Filter, Receipt, Banknote, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import CheckoutDialog from '../components/CheckoutDialog';
import ReceiptDialog from '../components/ReceiptDialog';
import { useSettings } from '@/hooks/useSettings';

export default function PaymentQueue() {
  const { currentUser } = useAppStore();
  const { currency, calculateTotal } = useSettings();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [completedSale, setCompletedSale] = useState<any | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const fetchUnpaidOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sales/unpaid-orders?business_id=${currentUser?.business_id}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser?.business_id) return;
    fetchUnpaidOrders();

    const es = new EventSource(`/api/orders/sse?business_id=${currentUser.business_id}`);
    
    es.addEventListener('UPDATE_ORDER', (e) => {
      try {
        const updatedOrder = JSON.parse(e.data);
        setOrders(prev => {
          // If order is cancelled or no longer ready/completed, remove it
          if (updatedOrder.status === 'Cancelled' || (updatedOrder.status !== 'Ready' && updatedOrder.status !== 'Completed')) {
            return prev.filter(o => o.id !== updatedOrder.id);
          }
          
          // Otherwise, update or add it
          const exists = prev.find(o => o.id === updatedOrder.id);
          if (exists) {
            return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
          }
          return [...prev, updatedOrder];
        });
      } catch (err) {
        console.error('Error parsing SSE data', err);
      }
    });

    es.addEventListener('DELETE_ORDER', (e) => {
      try {
        const deletedOrder = JSON.parse(e.data);
        setOrders(prev => prev.filter(o => o.id !== deletedOrder.id));
      } catch (err) {
        console.error('Error parsing SSE data', err);
      }
    });

    return () => {
      es.close();
    };
  }, [currentUser?.business_id]);

  const filteredOrders = orders.filter((o) => {
    const tableStr = `Table ${o.table?.table_number || o.table_id}`.toLowerCase();
    const idStr = o.id.toLowerCase();
    const s = search.toLowerCase();
    return tableStr.includes(s) || idStr.includes(s);
  });

  const handleCheckout = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setShowCheckout(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">Orders ready for payment</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search table or order..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" /> Filters
          </Button>
          <Button onClick={() => navigate(`/${currentUser?.role?.toLowerCase() || 'owner'}/sales/manual`)} className="gap-2 bg-primary text-primary-foreground">
            <Plus className="w-4 h-4" /> Manual Sale
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Receipt className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-bold">No pending payments</h3>
            <p className="text-muted-foreground max-w-sm mt-1">
              All completed orders have been paid, or there are no completed orders currently waiting for checkout.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredOrders.map((order) => {
            const tableNum = order.table?.table_number || 'Walk-in';
            const rawSubtotal = order.items.reduce((sum: number, item: any) => sum + (parseFloat(item.price) * parseFloat(item.quantity)), 0);
            const { total } = calculateTotal(rawSubtotal, 0);
            
            return (
              <Card key={order.id} className="group relative flex flex-col hover:border-primary/50 transition-all min-h-[200px] overflow-hidden cursor-pointer shadow-sm hover:shadow-md omni-paper-fold">
                <CardHeader className="pb-3 border-b bg-muted/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{tableNum}</CardTitle>
                      <p className="text-xs text-muted-foreground font-mono mt-1">#{order.id.split('-')[0]}</p>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 bg-amber-500/20 text-amber-700 rounded-full uppercase">
                      Unpaid
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 flex-1 flex flex-col relative pb-16">
                  <div className="text-sm space-y-2 flex-1 mb-4">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Items:</span>
                      <span className="font-medium text-foreground">{order.items.length} items</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Waiter:</span>
                      <span className="font-medium text-foreground">{order.waiter ? `${order.waiter.first_name}` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                      <span>Total:</span>
                      <span className="text-primary">{total.toFixed(2)} {currency}</span>
                    </div>
                  </div>
                </CardContent>

                {/* Hover Button Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 bg-gradient-to-t from-background/90 via-background/80 to-transparent">
                  <Button 
                    className="w-full gap-2 font-bold shadow-lg" 
                    size="lg"
                    onClick={() => handleCheckout(order.id)}
                  >
                    <Banknote className="w-5 h-5" />
                    Collect Payment
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {selectedOrder && (
        <CheckoutDialog 
          order={selectedOrder} 
          open={showCheckout} 
          onOpenChange={setShowCheckout}
          onSuccess={(data) => {
            fetchUnpaidOrders();
            setCompletedSale(data);
            setShowReceipt(true);
          }}
        />
      )}

      <ReceiptDialog
        sale={completedSale}
        open={showReceipt}
        onOpenChange={setShowReceipt}
      />
    </div>
  );
}
