import { useState, useEffect } from 'react';
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

  // Basic Shift State implementation
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [shiftStartTime, setShiftStartTime] = useState<Date | null>(null);

  const startShift = () => {
    setIsShiftActive(true);
    setShiftStartTime(new Date());
  };

  const endShift = () => {
    setIsShiftActive(false);
    setShiftStartTime(null);
  };

  // Mock data for Cashier Dashboard stats & transactions
  const shiftStats = {
    totalSales: 1250.00,
    transactionCount: 34,
    cashInDrawer: 1500.00
  };

  const recentTransactions = [
    { id: 1, type: 'INCOME', description: 'Order #1042', method: 'Cash', date: new Date().toISOString(), amount: 45.00 },
    { id: 2, type: 'INCOME', description: 'Order #1043', method: 'Card', date: new Date(Date.now() - 1000 * 60 * 15).toISOString(), amount: 120.50 },
    { id: 3, type: 'INCOME', description: 'Order #1044', method: 'Card', date: new Date(Date.now() - 1000 * 60 * 30).toISOString(), amount: 32.00 }
  ];

  return (
    <ScrollArea className="h-full w-full bg-background text-foreground">
      <div className="flex flex-col gap-8 p-8 max-w-[1600px] mx-auto omni-animate-in">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 omni-stagger-1">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Cashier Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage shift, transactions, and daily sales</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {!isShiftActive ? (
              <Button onClick={startShift} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Play className="w-4 h-4 mr-2" /> Start Shift
              </Button>
            ) : (
              <Button onClick={endShift} variant="destructive">
                <Square className="w-4 h-4 mr-2" /> End Shift
              </Button>
            )}
          </div>
        </div>

        {/* Shift Info & Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 omni-stagger-2">
          <Card className="bg-card border-border omni-kpi-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">Shift Status</CardTitle>
              <Clock className="w-4 h-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {isShiftActive ? (
                  <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">Active</Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {isShiftActive && shiftStartTime ? `Started at ${format(shiftStartTime, 'HH:mm a')}` : 'Start shift to record sales'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-800 text-white border-0 shadow-sm omni-kpi-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-emerald-50">Shift Sales</CardTitle>
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
            <CardContent className="p-0 flex-1">
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
                  {recentTransactions.map((tx: any, i: number) => (
                    <TableRow key={i} className="border-border/50 hover:bg-muted/50">
                      <TableCell>
                        <Badge variant="outline" className="bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 w-fit rounded-full px-2.5 py-0.5">
                          Income
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-card-foreground">{tx.description}</TableCell>
                      <TableCell className="text-muted-foreground">{tx.method}</TableCell>
                      <TableCell className="text-muted-foreground">{format(new Date(tx.date), 'HH:mm a')}</TableCell>
                      <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400">
                        +{tx.amount.toLocaleString()}
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
