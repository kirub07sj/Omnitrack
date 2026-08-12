import { 
  TrendingDown, 
  Plus, 
  FileText, 
  Package,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

export default function OwnerDashboard() {
  const { currentUser } = useAppStore();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('today');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/dashboard/owner?business_id=${currentUser?.business_id}&dateRange=${dateRange}`);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (e) {
      console.error("Failed to fetch owner dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.business_id) {
      fetchData();
    }
  }, [currentUser?.business_id, dateRange]);

  if (loading && !data) {
    return <div className="p-8 text-center text-muted-foreground flex h-full items-center justify-center">Loading dashboard...</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-destructive flex h-full items-center justify-center">Failed to load dashboard data.</div>;
  }

  const {
    financialSummary,
    salesPerformance,
    alerts,
    inventorySummary,
    recentTransactions
  } = data;

  const chartData = salesPerformance.chartData || [];

  return (
    <ScrollArea className="h-full w-full bg-background text-foreground">
      <div className="flex flex-col gap-8 p-8 max-w-[1600px] mx-auto omni-animate-in">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 omni-stagger-1">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Owner Dashboard</h1>
            <p className="text-muted-foreground mt-1">Enterprise Overview & Business Intelligence</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[150px] bg-card border-border">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="bg-muted border-border text-foreground hover:bg-accent hover:text-accent-foreground" onClick={() => navigate('/owner/expenses/new')}><Plus className="w-4 h-4 mr-2" /> Add Expense</Button>
            <Button variant="outline" className="bg-muted border-border text-foreground hover:bg-accent hover:text-accent-foreground" onClick={() => navigate('/owner/inventory/new')}><Package className="w-4 h-4 mr-2" /> Purchases</Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => navigate('/owner/reports')}><FileText className="w-4 h-4 mr-2" /> View Reports</Button>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 omni-stagger-2">
          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-800 text-white border-0 shadow-sm omni-kpi-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-emerald-50">Total Sales</CardTitle>
              <TrendingUp className="w-4 h-4 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {financialSummary.totalIncome.toLocaleString()} <span className="text-sm font-normal text-emerald-100">ETB</span>
              </div>
              <p className="text-xs text-emerald-100 mt-2 opacity-80 capitalize">{dateRange}</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border omni-kpi-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">Total Expenses</CardTitle>
              <TrendingDown className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {financialSummary.moneyOut.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">ETB</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Expenses & Purchases</p>
            </CardContent>
          </Card>

          <Card className="bg-emerald-100 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/30 omni-kpi-card text-emerald-950 dark:text-emerald-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-emerald-800 dark:text-emerald-300">Net Cash Flow</CardTitle>
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${financialSummary.netCashFlow >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                {financialSummary.netCashFlow > 0 ? '+' : ''}{financialSummary.netCashFlow.toLocaleString()} <span className="text-sm font-normal opacity-70">ETB</span>
              </div>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-300/70 mt-2">Operating margin</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Attention Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 omni-stagger-3">
          <Card className="bg-card border-border omni-chart-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base text-foreground capitalize">Sales & Expenses ({dateRange})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(153, 40%, 15%)" vertical={false} opacity={0.2} />
                    <XAxis dataKey="name" stroke="hsl(153, 20%, 40%)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(153, 20%, 40%)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value > 0 ? value / 1000 + 'k' : value}`} />
                    <Tooltip 
                      cursor={{fill: 'rgba(0,0,0,0.1)'}}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                    />
                    <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border omni-card-hover flex flex-col">
             <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> Attention Needed
                </CardTitle>
             </CardHeader>
             <CardContent className="p-0 flex-1">
                <div className="divide-y divide-border">
                  {alerts.lowStock > 0 && (
                    <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                      <div className="text-sm font-medium text-foreground">
                        {alerts.lowStock} products are low in stock
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigate('/owner/inventory')}>View</Button>
                    </div>
                  )}
                  {alerts.unpaidPurchases > 0 && (
                    <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                      <div className="text-sm font-medium text-foreground">
                        {alerts.unpaidPurchases} unpaid supplier purchases
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigate('/owner/inventory')}>View</Button>
                    </div>
                  )}
                  {alerts.unpaidExpenses > 0 && (
                    <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                      <div className="text-sm font-medium text-foreground">
                        {alerts.unpaidExpenses} pending expenses
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigate('/owner/expenses')}>View</Button>
                    </div>
                  )}
                  {/* Mocked License Alert as requested */}
                  <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                    <div className="text-sm font-medium text-foreground">
                      1 license renewal coming up
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate('/owner/settings')}>View</Button>
                  </div>
                  
                  {/* Empty state if nothing else needs attention except license */}
                  {alerts.lowStock === 0 && alerts.unpaidPurchases === 0 && alerts.unpaidExpenses === 0 && (
                     <div className="p-4 text-center text-sm text-emerald-500 font-medium">
                       All other systems are healthy.
                     </div>
                  )}
                </div>
             </CardContent>
          </Card>
        </div>

        {/* Lower Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8 omni-stagger-4">
          <Card className="bg-card border-border flex flex-col omni-card-hover lg:col-span-1">
            <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
              <CardTitle className="text-base text-foreground">Inventory Alerts</CardTitle>
              <Button variant="link" className="text-primary h-auto p-0" onClick={() => navigate('/owner/inventory')}>View All</Button>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <Table>
                <TableBody>
                  {inventorySummary.topLowStock.map((item: any, i: number) => (
                    <TableRow key={i} className="border-border/50 hover:bg-muted/50">
                      <TableCell className="font-medium text-card-foreground py-3">{item.name}</TableCell>
                      <TableCell className={`text-right text-xs font-medium py-3 ${Number(item.quantity) <= 0 ? 'text-red-500' : 'text-amber-500'}`}>
                        {Number(item.quantity)} {item.unit} <span className="text-muted-foreground block text-[10px]">(Par: {Number(item.minimum_quantity)})</span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {inventorySummary.topLowStock.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-6 text-muted-foreground">All inventory levels healthy.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="bg-card border-border flex flex-col omni-card-hover lg:col-span-2">
            <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
              <CardTitle className="text-base text-foreground">Recent Transactions</CardTitle>
              <Button variant="link" className="text-primary h-auto p-0" onClick={() => navigate('/owner/transactions')}>View All</Button>
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
                        {tx.type === 'INCOME' ? (
                          <Badge variant="outline" className="bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 transition-all font-semibold flex items-center gap-1.5 w-fit rounded-full px-2.5 py-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                            Income
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-500/25 transition-all font-semibold flex items-center gap-1.5 w-fit rounded-full px-2.5 py-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400" />
                            Expense
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-card-foreground">{tx.description}</TableCell>
                      <TableCell className="text-muted-foreground">{tx.method}</TableCell>
                      <TableCell className="text-muted-foreground">{format(new Date(tx.date), 'HH:mm a')}</TableCell>
                      <TableCell className={`text-right font-bold ${tx.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'}{tx.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {recentTransactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No recent transactions.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
}
