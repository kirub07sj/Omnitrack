import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, RotateCcw } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useSettings } from '@/hooks/useSettings';
import { apiFetch } from '@/lib/api';

interface RefundDialogProps {
  sale: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function RefundDialog({ sale, open, onOpenChange, onSuccess }: RefundDialogProps) {
  const { currentUser } = useAppStore();
  const { currency } = useSettings();
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!sale) return null;

  const handleRefund = async () => {
    if (!reason) {
      setError('A reason is required for refunds.');
      return;
    }

    if (amount && parseFloat(amount) > parseFloat(sale.total)) {
      setError('Refund amount cannot exceed the original sale total.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch('/api/sales/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: currentUser?.business_id,
          sale_id: sale.id,
          cashier_id: currentUser?.employee_id || currentUser?.id,
          reason,
          amount: amount ? parseFloat(amount) : parseFloat(sale.total)
        })
      });

      const data = await res.json();
      if (data.success) {
        onSuccess();
        onOpenChange(false);
      } else {
        setError(data.error || 'Failed to process refund');
      }
    } catch (e: any) {
      setError('Network error processing refund');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-destructive" /> 
            Refund Sale #{sale.id.split('-')[0]}
          </DialogTitle>
          <DialogDescription>
            Original Total: <span className="font-bold text-foreground">{parseFloat(sale.total).toFixed(2)} {currency}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Refund Amount ({currency})</Label>
            <Input 
              type="number" 
              placeholder={`Max: ${parseFloat(sale.total).toFixed(2)} (Leave empty for full refund)`} 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Leave empty to refund the entire amount.</p>
          </div>

          <div className="space-y-2">
            <Label>Reason for Refund <span className="text-destructive">*</span></Label>
            <Input 
              placeholder="e.g. Customer complaint, wrong order..." 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive font-medium">{error}</p>}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleRefund} disabled={loading} className="gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Confirm Refund
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
