import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import axios from 'axios';

interface ExpenseDetailsDialogProps {
  expense: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function ExpenseDetailsDialog({ expense, open, onOpenChange, onSuccess }: ExpenseDetailsDialogProps) {
  if (!expense) return null;

  const handleVoid = async () => {
    if (!confirm('Are you sure you want to void this expense? This action cannot be undone.')) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/expenses/${expense.id}`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to void expense', error);
      alert('Failed to void expense');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Expense Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="font-medium text-lg">{expense.category}</p>
            </div>
            <Badge variant={expense.status === 'PAID' ? 'default' : 'secondary'} className={expense.status === 'PAID' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-orange-500 text-white hover:bg-orange-600'}>
              {expense.status}
            </Badge>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Amount</p>
            <p className="font-bold text-2xl text-red-600">{parseFloat(expense.amount).toLocaleString()} <span className="text-sm font-normal">ETB</span></p>
          </div>

          {expense.description && (
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p>{expense.description}</p>
            </div>
          )}

          {expense.paid_to && (
            <div>
              <p className="text-sm text-muted-foreground">Paid To</p>
              <p>{expense.paid_to}</p>
            </div>
          )}

          <div>
            <p className="text-sm text-muted-foreground">Date</p>
            <p>{format(new Date(expense.date), 'MMMM dd, yyyy')}</p>
          </div>

          <div className="pt-6 flex gap-3">
            <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleVoid}>
              Void Expense
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
