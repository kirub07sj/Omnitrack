import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';
import { useSettings } from '@/hooks/useSettings';

interface PayExpenseDialogProps {
  expense: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function PayExpenseDialog({ expense, open, onOpenChange, onSuccess }: PayExpenseDialogProps) {
  const { currency, enabledPaymentMethods } = useSettings();
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState('Cash');
  const [reference, setReference] = useState('');

  if (!expense) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`/api/expenses/${expense.id}/pay`, {
        method,
        reference
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to pay expense', error);
      alert('Failed to pay expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Pay Expense</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-1">Amount Due</p>
          <p className="text-2xl font-bold">{parseFloat(expense.amount).toLocaleString()} <span className="text-sm font-normal">{currency}</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {enabledPaymentMethods.map((m) => (
                  <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Reference Number (Optional)</Label>
            <Input 
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. Receipt No"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Processing...' : 'Confirm Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
