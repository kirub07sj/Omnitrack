import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import axios from 'axios';
import { Switch } from '@/components/ui/switch';

export default function EditExpenseDialog({ expense, open, onOpenChange, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({
    category: '',
    amount: '',
    description: '',
    paid_to: '',
    date: '',
    status: 'PAID',
    method: 'Cash',
  });

  useEffect(() => {
    if (expense && open) {
      setFormData({
        category: expense.category || '',
        amount: expense.amount || '',
        description: expense.description || '',
        paid_to: expense.paid_to || '',
        date: expense.date ? format(new Date(expense.date), 'yyyy-MM-dd') : '',
        status: expense.status || 'PAID',
        method: expense.method || 'Cash'
      });
    }
  }, [expense, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.amount || !formData.date) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      await axios.put(`http://localhost:5000/api/expenses/${expense.id}`, {
        ...formData,
        amount: parseFloat(formData.amount)
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update expense', error);
      alert('Failed to update expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Rent">Rent</SelectItem>
                <SelectItem value="Utilities">Utilities</SelectItem>
                <SelectItem value="Salaries">Salaries</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Supplies">Supplies</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Amount (ETB) *</Label>
              <Input 
                type="number" 
                step="0.01" 
                value={formData.amount} 
                onChange={e => setFormData({...formData, amount: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input 
                type="date" 
                value={formData.date} 
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="What was this for?"
            />
          </div>

          <div className="space-y-2">
            <Label>Paid To (Vendor/Person)</Label>
            <Input 
              value={formData.paid_to} 
              onChange={e => setFormData({...formData, paid_to: e.target.value})}
            />
          </div>

          <div className="flex items-center justify-between border rounded-lg p-4 bg-muted/30">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold">Mark as Paid</Label>
              <p className="text-sm text-muted-foreground">Toggle to create or remove the transaction.</p>
            </div>
            <Switch
              checked={formData.status === 'PAID'}
              onCheckedChange={(checked: boolean) => setFormData({...formData, status: checked ? 'PAID' : 'UNPAID'})}
            />
          </div>

          {formData.status === 'PAID' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
              <Label>Payment Method</Label>
              <Select value={formData.method} onValueChange={(v) => setFormData({...formData, method: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Mobile Banking">Mobile Banking</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
