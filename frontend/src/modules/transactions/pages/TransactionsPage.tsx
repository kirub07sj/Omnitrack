import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettings } from '@/hooks/useSettings';
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from '@/lib/api';

export default function TransactionsPage() {
  const { currentUser } = useAppStore();
  const { currency, paymentMethods } = useSettings();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!currentUser?.business_id) return;
      try {
        const res = await apiFetch(`/api/transactions?business_id=${currentUser.business_id}`);
        const data = await res.json();
        if (data.success) {
          setTransactions(data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [currentUser?.business_id]);

  // Derived calculations (only for PAID)
  const totalIncome = transactions
    .filter(t => t.type === 'INCOME' && t.status?.toUpperCase() === 'PAID')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE' && t.status?.toUpperCase() === 'PAID')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  // Apply filters
  const filteredTransactions = transactions.filter(t => {
    if (t.status?.toUpperCase() !== 'PAID') return false; // Only show paid transactions
    if (typeFilter !== 'All' && t.type !== typeFilter) return false;
    if (methodFilter !== 'All' && t.method !== methodFilter) return false;
    return true;
  });

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, methodFilter]);

  // Pagination slice
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 omni-animate-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">View all your incoming and outgoing transactions.</p>
        </div>
        
        {/* Top Right Totals (Normal fonts, smaller labels) */}
        <div className="flex items-center gap-6 bg-muted/30 px-4 py-2 rounded-lg border">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">income</span>
            <span className="text-emerald-600 font-bold">{totalIncome.toLocaleString()} <span className="text-xs font-normal">{currency}</span></span>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">expenses</span>
            <span className="text-red-600 font-bold">{totalExpense.toLocaleString()} <span className="text-xs font-normal">{currency}</span></span>
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Transaction History</CardTitle>
            
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Types</SelectItem>
                  <SelectItem value="INCOME">Income</SelectItem>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Methods</SelectItem>
                  {paymentMethods.map(m => (
                    <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                  ))}
                  <SelectItem value="Refund">Refund</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
                  <tr>
                    <td colSpan={7} className="py-6 px-4">
                      <div className="space-y-3 w-full">
                        {Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-md" />)}
                      </div>
                    </td>
                  </tr>
                ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="px-6">Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right px-6">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="px-6">{format(new Date(tx.date), 'MMM dd, yyyy HH:mm')}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {tx.type === 'INCOME' ? (
                            <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-red-500" />
                          )}
                          <span className={tx.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}>
                            {tx.type === 'INCOME' ? 'Income' : 'Expense'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm font-mono">
                        {tx.order_id ? `ORD-${tx.order_id.substring(0, 8)}` : tx.purchase_id ? `PUR-${tx.purchase_id.substring(0, 8)}` : tx.expense_id ? `EXP-${tx.expense_id.substring(0, 8)}` : '-'}
                      </TableCell>
                      <TableCell>{tx.method || '-'}</TableCell>
                      <TableCell className={`text-right px-6 font-bold ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'}{parseFloat(tx.amount).toLocaleString()} <span className="text-xs font-normal">{currency}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        No transactions found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-6 py-4">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-foreground">{Math.min(currentPage * itemsPerPage, filteredTransactions.length)}</span> of <span className="font-medium text-foreground">{filteredTransactions.length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <div className="text-sm font-medium px-2">
                  Page {currentPage} of {totalPages}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
