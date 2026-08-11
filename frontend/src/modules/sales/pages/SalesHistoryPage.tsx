import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Filter, Printer, RotateCcw, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import ReceiptDialog from '../components/ReceiptDialog';
import RefundDialog from '../components/RefundDialog';
import { CheckCircle2 } from 'lucide-react';

export default function SalesHistoryPage() {
  const { currentUser } = useAppStore();
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedSale, setSelectedSale] = useState<any | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showRefund, setShowRefund] = useState(false);
  const [refundSuccess, setRefundSuccess] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 40;

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sales/history?business_id=${currentUser?.business_id}`);
      const data = await res.json();
      if (data.success) {
        setSales(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.business_id) fetchSales();
  }, [currentUser?.business_id]);

  const filteredSales = sales.filter((s) => {
    // Filter by Date
    if (date) {
      const saleDate = format(new Date(s.created_at), 'yyyy-MM-dd');
      const selectedDateStr = format(date, 'yyyy-MM-dd');
      if (saleDate !== selectedDateStr) return false;
    }

    // Filter by Search Query
    const tableStr = s.order?.table ? `Table ${s.order.table.table_number}`.toLowerCase() : 'walk-in';
    const idStr = s.id.toLowerCase();
    const orderIdStr = s.order_id.toLowerCase();
    const q = search.toLowerCase();
    return tableStr.includes(q) || idStr.includes(q) || orderIdStr.includes(q);
  });

  // Reset to first page when search or date changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, date]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const paginatedSales = filteredSales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Calculate metrics based on current filtered (and date-selected) sales
  const totalAmount = filteredSales.reduce((sum, s) => sum + parseFloat(s.total), 0);
  const cashSales = filteredSales.filter(s => s.order?.transactions?.[0]?.method === 'Cash' || s.payment_method === 'Cash').reduce((sum, s) => sum + parseFloat(s.total), 0);
  const mobileSales = filteredSales.filter(s => s.order?.transactions?.[0]?.method === 'Mobile Banking' || s.payment_method === 'Mobile Banking').reduce((sum, s) => sum + parseFloat(s.total), 0);
  const totalRefunds = filteredSales.filter(s => parseFloat(s.total) < 0).reduce((sum, s) => sum + Math.abs(parseFloat(s.total)), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sales History</h2>
          <p className="text-muted-foreground">View and manage completed financial transactions</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by ID or table..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-col items-end space-y-1">
            <div className="flex items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                  />
                </PopoverContent>
              </Popover>
              {date && (
                <Button variant="ghost" onClick={() => setDate(undefined)} className="px-2 text-muted-foreground hover:text-foreground">
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Total Sales</div>
            <div className="text-2xl font-bold text-primary">
              {totalAmount.toFixed(2)} <span className="text-xs font-normal">ETB</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Transactions</div>
            <div className="text-2xl font-bold">{filteredSales.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Cash Sales</div>
            <div className="text-2xl font-bold">
              {cashSales.toFixed(2)} <span className="text-xs font-normal text-muted-foreground">ETB</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Mobile Banking</div>
            <div className="text-2xl font-bold">
              {mobileSales.toFixed(2)} <span className="text-xs font-normal text-muted-foreground">ETB</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Refunds</div>
            <div className="text-2xl font-bold text-destructive">
              {totalRefunds.toFixed(2)} <span className="text-xs font-normal">ETB</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold">Sale / Order ID</th>
                  <th className="px-6 py-4 font-semibold">Date & Time</th>
                  <th className="px-6 py-4 font-semibold">Table</th>
                  <th className="px-6 py-4 font-semibold">Cashier</th>
                  <th className="px-6 py-4 font-semibold">Total</th>
                  <th className="px-6 py-4 font-semibold">Payment</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                    </td>
                  </tr>
                ) : filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">
                      No sales found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedSales.map((sale) => {
                    const firstPayment = sale.order?.transactions?.[0];
                    return (
                      <tr key={sale.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-foreground">#{sale.id.split('-')[0]}</div>
                          <div className="text-xs text-muted-foreground font-mono">Ord: #{sale.order_id.split('-')[0]}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>{format(new Date(sale.created_at), 'MMM d, yyyy')}</div>
                          <div className="text-xs text-muted-foreground">{format(new Date(sale.created_at), 'h:mm a')}</div>
                        </td>
                        <td className="px-6 py-4">
                          {sale.order?.table ? `Table ${sale.order.table.table_number}` : 'Walk-in'}
                        </td>
                        <td className="px-6 py-4">
                          {sale.cashier?.first_name || 'System'}
                        </td>
                        <td className="px-6 py-4 font-bold text-foreground">
                          {parseFloat(sale.total).toFixed(2)} <span className="text-xs font-normal text-muted-foreground">ETB</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                            {firstPayment?.method || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Print Receipt"
                              onClick={() => {
                                setSelectedSale(sale);
                                setShowReceipt(true);
                              }}
                            >
                              <Printer className="w-4 h-4 text-muted-foreground" />
                            </Button>
                            {parseFloat(sale.total) > 0 && sale.order?.status !== 'Cancelled' && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                title="Refund" 
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  setSelectedSale(sale);
                                  setShowRefund(true);
                                }}
                              >
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-6 py-4">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-foreground">{Math.min(currentPage * itemsPerPage, filteredSales.length)}</span> of <span className="font-medium text-foreground">{filteredSales.length}</span> sales
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

      <ReceiptDialog
        sale={selectedSale}
        open={showReceipt}
        onOpenChange={setShowReceipt}
      />

      <RefundDialog
        sale={selectedSale}
        open={showRefund}
        onOpenChange={setShowRefund}
        onSuccess={() => {
          fetchSales();
          setRefundSuccess(true);
          setTimeout(() => setRefundSuccess(false), 3000);
        }}
      />

      {refundSuccess && (
        <div className="fixed top-6 right-6 bg-emerald-500 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 z-50 animate-in slide-in-from-top-5 fade-in duration-300">
          <CheckCircle2 className="w-5 h-5" />
          <p className="font-medium">Refund processed successfully!</p>
        </div>
      )}
    </div>
  );
}
