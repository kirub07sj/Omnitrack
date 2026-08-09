import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, Banknote, Smartphone, CreditCard } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface CheckoutDialogProps {
  order: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (data?: any) => void;
  isManual?: boolean;
}

export default function CheckoutDialog({ order, open, onOpenChange, onSuccess, isManual = false }: CheckoutDialogProps) {
  const { currentUser } = useAppStore();
  const [method, setMethod] = useState<'Cash' | 'Mobile Banking' | 'Card'>('Cash');
  const [received, setReceived] = useState<string>('');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!order) return null;

  const subtotal = order.items.reduce((sum: number, item: any) => sum + (parseFloat(item.price) * parseFloat(item.quantity)), 0);
  const tax = 0;
  const discount = 0;
  const total = subtotal + tax - discount;
  const change = method === 'Cash' && received ? parseFloat(received) - total : 0;

  const handleCheckout = async () => {
    if (method === 'Cash') {
      if (!received || parseFloat(received) < total) {
        setError('Received amount must be greater than or equal to total');
        return;
      }
    } else if (method === 'Mobile Banking' && !reference) {
      setError('Payment reference is required for mobile banking');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint = isManual ? '/api/sales/manual' : '/api/sales/checkout';
      
      const payload: any = {
        business_id: currentUser?.business_id,
        cashier_id: currentUser?.employee_id || currentUser?.id,
        payment_method: method,
        subtotal,
        tax,
        discount,
        total,
        amount_received: method === 'Cash' ? parseFloat(received) : total,
        reference: method !== 'Cash' ? reference : undefined,
      };

      if (isManual) {
        payload.table_id = order.table_id;
        payload.waiter_id = order.waiter_id;
        payload.items = order.items.map((i: any) => ({
          product_id: i.product?.id || i.product_id,
          quantity: i.quantity,
          price: i.price
        }));
      } else {
        payload.order_id = order.id;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        onSuccess();
        onOpenChange(false);
      } else {
        setError(data.error || 'Failed to checkout');
      }
    } catch (e: any) {
      setError('Network error during checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-6 sm:p-8">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold flex justify-between items-center">
            <span>{isManual ? 'Complete Manual Sale' : `Checkout Order #${order.id?.split('-')[0]}`}</span>
            <span className="text-primary">{total.toFixed(2)} ETB</span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-4">
            <h4 className="font-semibold text-muted-foreground uppercase text-xs">Order Summary</h4>
            <div className="bg-muted/30 p-4 rounded-xl space-y-3">
              <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                {order.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.product?.name}</span>
                    <span className="font-medium">{(item.quantity * item.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 space-y-1">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2">
                  <span>Total Due</span>
                  <span className="text-primary">{total.toFixed(2)} ETB</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-muted-foreground uppercase text-xs">Payment Details</h4>
            
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={method === 'Cash' ? 'default' : 'outline'}
                className="flex flex-col gap-1 h-auto py-3"
                onClick={() => setMethod('Cash')}
              >
                <Banknote className="w-5 h-5" />
                <span className="text-xs">Cash</span>
              </Button>
              <Button
                variant={method === 'Mobile Banking' ? 'default' : 'outline'}
                className="flex flex-col gap-1 h-auto py-3 px-1"
                onClick={() => setMethod('Mobile Banking')}
              >
                <Smartphone className="w-5 h-5" />
                <span className="text-[10px] leading-tight text-center">Mobile<br/>Banking</span>
              </Button>
              <Button
                variant={method === 'Card' ? 'default' : 'outline'}
                className="flex flex-col gap-1 h-auto py-3"
                onClick={() => setMethod('Card')}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-xs">Card</span>
              </Button>
            </div>

            {method === 'Cash' && (
              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <Label>Amount Received (ETB)</Label>
                  <Input 
                    type="number" 
                    placeholder="e.g. 1000" 
                    value={received}
                    onChange={(e) => setReceived(e.target.value)}
                    className="text-lg h-12 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
                {received && parseFloat(received) >= total && (
                  <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg border border-emerald-200 flex justify-between items-center">
                    <span className="font-medium">Change to return:</span>
                    <span className="font-bold text-lg">{change.toFixed(2)} ETB</span>
                  </div>
                )}
              </div>
            )}

            {method === 'Mobile Banking' && (
              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <Label>Reference Number</Label>
                  <Input 
                    type="text" 
                    placeholder="Transaction ref..." 
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                  />
                </div>
              </div>
            )}

            {error && <p className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-md">{error}</p>}

            <Button 
              className="w-full h-14 text-lg font-bold mt-6 shadow-md" 
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Complete Payment
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
