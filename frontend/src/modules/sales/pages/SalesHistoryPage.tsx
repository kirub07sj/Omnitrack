import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Filter, Eye, Printer, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import ReceiptDialog from '../components/ReceiptDialog';
import RefundDialog from '../components/RefundDialog';

export default function SalesHistoryPage() {
  const { currentUser } = useAppStore();
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSale, setSelectedSale] = useState<any | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showRefund, setShowRefund] = useState(false);

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
    const tableStr = s.order?.table ? `Table ${s.order.table.table_number}`.toLowerCase() : 'walk-in';
    const idStr = s.id.toLowerCase();
    const orderIdStr = s.order_id.toLowerCase();
    const q = search.toLowerCase();
    return tableStr.includes(q) || idStr.includes(q) || orderIdStr.includes(q);
  });

  // Calculate metrics
  const today = new Date().toDateString();
  const todaySales = sales.filter(s => new Date(s.created_at).toDateString() === today);
  const totalAmountToday = todaySales.reduce((sum, s) => sum + parseFloat(s.total), 0);
  const cashSales = todaySales.filter(s => s.order?.payments?.[0]?.method === 'Cash').reduce((sum, s) => sum + parseFloat(s.total), 0);
  const mobileSales = todaySales.filter(s => s.order?.payments?.[0]?.method === 'Mobile Banking').reduce((sum, s) => sum + parseFloat(s.total), 0);
  const cardSales = todaySales.filter(s => s.order?.payments?.[0]?.method === 'Card').reduce((sum, s) => sum + parseFloat(s.total), 0);
  const totalRefunds = todaySales.filter(s => parseFloat(s.total) < 0).reduce((sum, s) => sum + Math.abs(parseFloat(s.total)), 0);

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
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" /> Filters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Today's Sales</div>
            <div className="text-2xl font-bold">{totalAmountToday.toFixed(2)} ETB</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Transactions</div>
            <div className="text-2xl font-bold">{todaySales.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Cash Sales</div>
            <div className="text-2xl font-bold">{cashSales.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Mobile Banking</div>
            <div className="text-2xl font-bold">{mobileSales.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Refunds</div>
            <div className="text-2xl font-bold text-destructive">{totalRefunds.toFixed(2)}</div>
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
                  filteredSales.map((sale) => {
                    const firstPayment = sale.order?.payments?.[0];
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
                          {parseFloat(sale.total).toFixed(2)} ETB
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                            {firstPayment?.method || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" title="View Details">
                              <Eye className="w-4 h-4 text-muted-foreground" />
                            </Button>
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
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
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
          alert('Refund processed successfully!');
        }}
      />
    </div>
  );
}
