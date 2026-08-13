import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, Banknote, Smartphone, CreditCard, Wallet } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useSettings } from '@/hooks/useSettings';

interface CheckoutDialogProps {
  order: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (data?: any) => void;
  isManual?: boolean;
}

export default function CheckoutDialog({ order, open, onOpenChange, onSuccess, isManual = false }: CheckoutDialogProps) {
  const { currentUser } = useAppStore();
  const { currency, taxSettings, calculateTotal, enabledPaymentMethods } = useSettings();
  const [method, setMethod] = useState<string>('Cash');
  const [received, setReceived] = useState<string>('');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setMethod('Cash');
      setReceived('');
      setReference('');
      setError(null);
      setLoading(false);
    }
  }, [open]);

  if (!order) return null;

  const rawSubtotal = order.items.reduce((sum: number, item: any) => sum + (parseFloat(item.price) * parseFloat(item.quantity)), 0);
  const discount = 0;
  const { subtotal, tax, serviceCharge, total } = calculateTotal(rawSubtotal, discount);
  const change = method === 'Cash' && received ? parseFloat(received) - total : 0;

  const handleCheckout = async () => {
    if (loading) return;
    
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
        serviceCharge,
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
      <DialogContent className="sm:max-w-3xl h-[90vh] sm:h-[500px] p-6 sm:p-8 flex flex-col">
        <DialogHeader className="mb-2 shrink-0">
          <DialogTitle className="text-2xl font-bold flex justify-between items-center">
            <span>{isManual ? 'Complete Manual Sale' : `Checkout Order #${order.id?.split('-')[0]}`}</span>
            <span className="text-primary">{total.toFixed(2)} {currency}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 overflow-hidden min-h-0">
          <div className="flex flex-col h-full overflow-hidden">
            <h4 className="font-semibold text-muted-foreground uppercase text-xs mb-3 shrink-0">Order Summary</h4>
            <div className="bg-muted/30 p-4 rounded-xl flex flex-col flex-1 overflow-hidden border border-border/50">
              <div className="overflow-y-auto flex-1 space-y-2 pr-2 custom-scrollbar">
                {order.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.product?.name}</span>
                    <span className="font-medium">{(item.quantity * item.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 space-y-1 mt-3 shrink-0">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{subtotal.toFixed(2)}</span>
                </div>
                {taxSettings.enableTax && (
                  <div className="flex justify-between text-sm text-muted-foreground pt-1">
                    <span>{taxSettings.taxName} ({taxSettings.taxRate}%)</span>
                    <span>{tax.toFixed(2)}</span>
                  </div>
                )}
                {taxSettings.enableServiceCharge && (
                  <div className="flex justify-between text-sm text-muted-foreground pt-1">
                    <span>Service Charge ({taxSettings.serviceChargeRate}%)</span>
                    <span>{serviceCharge.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-1">
                  <span>Total Due</span>
                  <span className="text-primary">{total.toFixed(2)} {currency}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col h-full">
            <h4 className="font-semibold text-muted-foreground uppercase text-xs mb-3 shrink-0">Payment Details</h4>
            
            <div className="grid grid-cols-3 gap-2 shrink-0">
              {enabledPaymentMethods.map((pm: any) => {
                let Icon = Wallet;
                if (pm.name === 'Cash') Icon = Banknote;
                else if (pm.name === 'Mobile Banking') Icon = Smartphone;
                else if (pm.name === 'Card') Icon = CreditCard;

                return (
                  <Button
                    key={pm.id}
                    variant={method === pm.name ? 'default' : 'outline'}
                    className="flex flex-col gap-1 h-auto py-3 px-1"
                    onClick={() => setMethod(pm.name)}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px] leading-tight text-center whitespace-normal">
                      {pm.name.includes(' ') ? pm.name.split(' ').map((word: string, i: number) => <span key={i}>{word}<br/></span>) : pm.name}
                    </span>
                  </Button>
                );
              })}
            </div>

            <div className="flex-1 flex flex-col justify-end relative mt-12 pb-4">
              <div className="absolute bottom-[88px] left-0 right-0 w-full z-10 flex flex-col gap-2 pointer-events-none">
                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive px-3 py-2.5 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-bottom-2 shadow-sm pointer-events-auto">
                    {error}
                  </div>
                )}
                {!error && method === 'Cash' && received && parseFloat(received) >= total && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2.5 rounded-lg flex justify-between items-center animate-in fade-in slide-in-from-bottom-2 shadow-sm pointer-events-auto">
                    <span className="font-medium text-sm">Change to return:</span>
                    <span className="font-bold text-lg">{change.toFixed(2)} {currency}</span>
                  </div>
                )}
              </div>

              {method === 'Cash' && (
                <div className="space-y-1.5 shrink-0">
                  <Label className="text-muted-foreground font-semibold text-xs uppercase">Amount Received ({currency})</Label>
                  <Input 
                    type="number" 
                    placeholder="e.g. 1000" 
                    value={received}
                    onChange={(e) => setReceived(e.target.value)}
                    className="text-lg h-12 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
              )}

              {method === 'Mobile Banking' && (
                <div className="space-y-1.5 shrink-0">
                  <Label className="text-muted-foreground font-semibold text-xs uppercase">Reference Number</Label>
                  <Input 
                    type="text" 
                    placeholder="Transaction ref..." 
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="text-lg h-12"
                  />
                </div>
              )}
            </div>

            <Button 
              className="w-full h-14 text-lg font-bold mt-auto shadow-md shrink-0 transition-all active:scale-[0.98]" 
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
