import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Plus, Search, MoreHorizontal, Pencil, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import PayExpenseDialog from '../components/PayExpenseDialog';
import EditExpenseDialog from '../components/EditExpenseDialog';
import DeleteExpenseDialog from '../components/DeleteExpenseDialog';
import AddExpenseDialog from '../components/AddExpenseDialog';

export default function ExpensesPage() {
  const { currentUser, fetchUnpaidCounts } = useAppStore();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [showAdd, setShowAdd] = useState(false);
  const [showPay, setShowPay] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const fetchExpenses = async () => {
    if (!currentUser?.business_id) return;
    try {
      const { data } = await axios.get(`http://localhost:5000/api/expenses?business_id=${currentUser.business_id}`);
      setExpenses(data.data);
      fetchUnpaidCounts(); // Refresh global unpaid counts
    } catch (error) {
      console.error('Failed to fetch expenses', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedExpense) return;
    try {
      await axios.delete(`http://localhost:5000/api/expenses/${selectedExpense.id}`);
      fetchExpenses();
    } catch (error) {
      console.error('Failed to delete expense', error);
      alert('Failed to delete expense');
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [currentUser?.business_id]);

  // Derived metrics for current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalThisMonth = thisMonthExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const totalPaid = thisMonthExpenses.filter(e => e.status === 'PAID').reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const totalUnpaid = thisMonthExpenses.filter(e => e.status === 'UNPAID').reduce((sum, e) => sum + parseFloat(e.amount), 0);

  // Apply filters
  const categories = Array.from(new Set(expenses.map(e => e.category)));
  
  const filteredExpenses = expenses.filter(e => {
    if (statusFilter !== 'All' && e.status !== statusFilter) return false;
    if (categoryFilter !== 'All' && e.category !== categoryFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return e.description?.toLowerCase().includes(s) || 
             e.category?.toLowerCase().includes(s) || 
             e.paid_to?.toLowerCase().includes(s);
    }
    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalThisMonth.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">ETB</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{totalPaid.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">ETB</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unpaid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">{totalUnpaid.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">ETB</span></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <CardTitle className="text-xl">Recent Expenses</CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Search expenses..." 
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  {categories.map(c => (
                    <SelectItem key={c as string} value={c as string}>{c as string}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="UNPAID">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-muted-foreground">Loading expenses...</td>
                  </tr>
                ) : filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-muted-foreground">No expenses found.</td>
                  </tr>
                ) : (
                  filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">{format(new Date(expense.date), 'MMM dd, yyyy')}</td>
                      <td className="px-6 py-4 font-medium">{expense.category}</td>
                      <td className="px-6 py-4 text-muted-foreground truncate max-w-[200px]">{expense.description || expense.paid_to || '-'}</td>
                      <td className="px-6 py-4 font-bold">{parseFloat(expense.amount).toLocaleString()} <span className="text-xs font-normal">ETB</span></td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${expense.status === 'PAID' ? 'bg-primary/20 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
                          {expense.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        {expense.status === 'UNPAID' && (
                          <Button 
                            variant="default" 
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 h-8"
                            onClick={() => {
                              setSelectedExpense(expense);
                              setShowPay(true);
                            }}
                          >
                            Pay Now
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="cursor-pointer" onClick={() => { setSelectedExpense(expense); setShowEdit(true); }}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700" onClick={() => { setSelectedExpense(expense); setShowDelete(true); }}>
                              <Trash className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <PayExpenseDialog 
        expense={selectedExpense} 
        open={showPay} 
        onOpenChange={setShowPay} 
        onSuccess={fetchExpenses} 
      />

      <EditExpenseDialog 
        expense={selectedExpense} 
        open={showEdit} 
        onOpenChange={setShowEdit} 
        onSuccess={fetchExpenses} 
      />

      <DeleteExpenseDialog 
        open={showDelete} 
        onOpenChange={setShowDelete} 
        onConfirm={handleDelete}
      />

      <AddExpenseDialog 
        open={showAdd} 
        onOpenChange={setShowAdd} 
        onSuccess={fetchExpenses} 
      />
    </div>
  );
}
