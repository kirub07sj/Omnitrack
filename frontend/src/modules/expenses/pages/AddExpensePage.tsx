import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/store/useAppStore';
import { useSettings } from '@/hooks/useSettings';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';

const CATEGORIES = [
  'Cleaning', 'Maintenance', 'Repairs', 'Transportation', 'Packaging', 'Security',
  'Electricity', 'Water', 'Internet', 'Gas', 
  'Building Rent', 'Equipment Rent',
  'Salary', 'Overtime', 'Staff Meals', 'Other Staff Costs',
  'License', 'Government Fees', 'Other Taxes',
  'Miscellaneous'
];

export default function AddExpensePage() {
  const navigate = useNavigate();
  const { currentUser } = useAppStore();
  const { currency, enabledPaymentMethods } = useSettings();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: '',
    paid_to: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    status: 'PAID',
    method: 'Cash',
    reference: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.business_id) {
      alert("Error: No business selected. Please refresh the page.");
      return;
    }
    
    if (!formData.category) {
      alert("Please select a category");
      return;
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (!formData.date) {
      alert("Please select a date");
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/expenses', {
        ...formData,
        business_id: currentUser.business_id,
        amount: parseFloat(formData.amount)
      });
      navigate(`/${currentUser?.role?.toLowerCase() || 'owner'}/expenses`);
    } catch (error) {
      console.error('Failed to save expense', error);
      alert('Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Record Expense</h1>
          <p className="text-muted-foreground">Add a new expense or outgoing payment</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Details</CardTitle>
          <CardDescription>Enter the basic information about this expense.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Category <span className="text-destructive">*</span></Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(val) => setFormData({...formData, category: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Amount ({currency}) <span className="text-destructive">*</span></Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Input 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="e.g. August electricity bill"
                />
              </div>

              <div className="space-y-2">
                <Label>Paid To / Vendor</Label>
                <Input 
                  value={formData.paid_to}
                  onChange={(e) => setFormData({...formData, paid_to: e.target.value})}
                  placeholder="e.g. Ethiopian Electric Utility"
                />
              </div>

              <div className="space-y-2">
                <Label>Date <span className="text-destructive">*</span></Label>
                <Input 
                  type="date" 
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>

              <div className="space-y-2 md:col-span-2 pt-4 border-t mt-2">
                <Label>Payment Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(val) => setFormData({...formData, status: val})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="UNPAID">Unpaid (Accounts Payable)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.status === 'PAID' && (
                <>
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select 
                      value={formData.method} 
                      onValueChange={(val) => setFormData({...formData, method: val})}
                    >
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
                      value={formData.reference}
                      onChange={(e) => setFormData({...formData, reference: e.target.value})}
                      placeholder="e.g. EE-92831"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="px-8">
                {loading ? 'Saving...' : 'Save Expense'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
