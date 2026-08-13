import { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, Square, Wallet, ArrowRightLeft, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppStore } from '@/store/useAppStore';
import { useSettings } from '@/hooks/useSettings';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function CashierDashboard() {
  const { currentUser } = useAppStore();
  const { currency } = useSettings();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.business_id) return;
      setLoading(true);
      try {
        const res = await axios.get(`/api/dashboard/owner?business_id=${currentUser.business_id}&dateRange=today`);
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch cashier dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [currentUser?.business_id]);

  const shiftStats = {
    totalSales: data?.financialSummary?.totalIncome || 0,
    transactionCount: data?.financialSummary?.transactions || 0,
    cashInDrawer: data?.financialSummary?.cashIncome || 0
  };

  const recentTransactions = data?.recentTransactions?.slice(0, 5) || [];

  return (
    <ScrollArea className="h-full w-full bg-background text-foreground">
      <div className="flex flex-col gap-8 p-8 max-w-[1600px] mx-auto omni-animate-in">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 omni-stagger-1">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Cashier Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage transactions and daily sales</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 omni-stagger-2">

          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-800 text-white border-0 shadow-sm omni-kpi-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-emerald-50">Today's Sales</CardTitle>
              <Wallet className="w-4 h-4 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {shiftStats.totalSales.toLocaleString()} <span className="text-sm font-normal text-emerald-100">{currency}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border omni-kpi-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">Transactions</CardTitle>
              <ArrowRightLeft className="w-4 h-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {shiftStats.transactionCount}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-emerald-100 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/30 omni-kpi-card text-emerald-950 dark:text-emerald-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-emerald-800 dark:text-emerald-300">Cash in Drawer</CardTitle>
              <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">
                {shiftStats.cashInDrawer.toLocaleString()} <span className="text-sm font-normal opacity-70">{currency}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8 omni-stagger-3">
          <Card className="bg-card border-border flex flex-col omni-card-hover lg:col-span-3">
            <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
              <CardTitle className="text-base text-foreground">Recent Transactions</CardTitle>
              <Button variant="link" className="text-primary h-auto p-0" onClick={() => navigate('/cashier/transactions')}>View All</Button>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-2 flex-1 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Type</TableHead>
                    <TableHead className="text-muted-foreground">Description</TableHead>
                    <TableHead className="text-muted-foreground">Method</TableHead>
                    <TableHead className="text-muted-foreground">Time</TableHead>
                    <TableHead className="text-muted-foreground text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        No transactions today
                      </TableCell>
                    </TableRow>
                  )}
                  {recentTransactions.map((tx: any, i: number) => (
                    <TableRow key={tx.id || i} className="border-border/50 hover:bg-muted/50">
                      <TableCell>
                        <Badge variant="outline" className="bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 w-fit rounded-full px-2.5 py-0.5">
                          {tx.type || 'Income'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-card-foreground">
                        {tx.order_id ? `Order #${tx.order_id.split('-')[0]}` : tx.description || 'Sale'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{tx.payment_method || tx.method || 'Cash'}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {tx.created_at ? format(new Date(tx.created_at), 'HH:mm a') : format(new Date(tx.date || Date.now()), 'HH:mm a')}
                      </TableCell>
                      <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400">
                        +{Number(tx.amount || tx.total || 0).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
}
