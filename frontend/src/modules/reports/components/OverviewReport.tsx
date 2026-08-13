import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { startOfWeek, startOfMonth, format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettings } from '@/hooks/useSettings';

const COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#047857', '#a7f3d0'];

export function OverviewReport({ dateRange, refreshTrigger = 0 }: { dateRange: { startDate: string, endDate: string }, refreshTrigger?: number }) {
  const { currency } = useSettings();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('day');

  useEffect(() => {
    const fetchOverview = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams(dateRange as any).toString();
        const res = await fetch(`/api/reports/overview?${query}`);
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, [dateRange, refreshTrigger]);

  const handleExport = () => {
    if (!data) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + `Metric,Amount (${currency})\n`
      + `Total Income,${data.totalIncome}\n`
      + `Total Expenses,${data.totalExpense}\n`
      + `Net Cash Flow,${data.netCashFlow}\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Financial_Summary_${dateRange.startDate}_to_${dateRange.endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="h-64 flex items-center justify-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed mt-4">Loading Financial Summary...</div>;
  }

  if (!data) return null;

  const getGroupedData = () => {
    if (!data?.chartData) return [];
    
    if (timeframe === 'day') return data.chartData.map((d: any) => ({
      date: format(new Date(d.date), 'MMM dd'),
      Income: d.income || 0,
      Expense: d.expense || 0
    }));

    const grouped = data.chartData.reduce((acc: any, curr: any) => {
      const dateObj = new Date(curr.date);
      let key = '';
      if (timeframe === 'week') {
        key = format(startOfWeek(dateObj, { weekStartsOn: 1 }), 'MMM dd, yyyy');
      } else {
        key = format(startOfMonth(dateObj), 'MMM yyyy');
      }
      
      if (!acc[key]) {
        acc[key] = { date: key, Income: 0, Expense: 0 };
      }
      acc[key].Income += (curr.income || 0);
      acc[key].Expense += (curr.expense || 0);
      return acc;
    }, {});
    
    return Object.values(grouped);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle>Financial Summary</CardTitle>
          <CardDescription>Overview of your business performance for the selected period.</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}><Download className="w-4 h-4 mr-2" /> Export</Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Card className="shadow-sm bg-gradient-to-r from-emerald-500 to-emerald-800 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-emerald-50">Total Income (Money In)</p>
                <TrendingUp className="w-4 h-4 text-emerald-100" />
              </div>
              <p className="text-2xl font-bold mt-2 text-white">+{data.totalIncome?.toLocaleString() || 0} {currency}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Total Expenses (Money Out)</p>
                <TrendingDown className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-2xl font-bold mt-2 text-red-600">-{data.totalExpense?.toLocaleString() || 0} {currency}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Net Cash Flow</p>
                <DollarSign className="w-4 h-4 text-primary" />
              </div>
              <p className={`text-2xl font-bold mt-2 ${data.netCashFlow >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {data.netCashFlow > 0 ? '+' : ''}{data.netCashFlow?.toLocaleString() || 0} {currency}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Financial Trend Chart */}
          <div className="lg:col-span-2 border rounded-xl p-6 bg-card shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg">Financial Trend</h3>
              <Select value={timeframe} onValueChange={(val: any) => setTimeframe(val)}>
                <SelectTrigger className="w-[120px] h-8">
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Daily</SelectItem>
                  <SelectItem value="week">Weekly</SelectItem>
                  <SelectItem value="month">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {data.chartData && data.chartData.length > 0 ? (
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getGroupedData()} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fontSize: 12, fill: '#6b7280' }} 
                      dy={10}
                    />
                    <YAxis 
                      tickFormatter={(value) => `${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`} 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fontSize: 12, fill: '#6b7280' }} 
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`${value.toLocaleString()} ${currency}`, undefined]}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Line 
                      type="monotone" 
                      dataKey="Income" 
                      stroke="#10b981" 
                      strokeWidth={3} 
                      dot={{ r: 4, strokeWidth: 2 }} 
                      activeDot={{ r: 6 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Expense" 
                      stroke="#ef4444" 
                      strokeWidth={3} 
                      dot={{ r: 4, strokeWidth: 2 }} 
                      activeDot={{ r: 6 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground border-dashed border rounded-lg">No financial data for this period</div>
            )}
          </div>

          {/* Top Products Pie Chart */}
          <div className="lg:col-span-1 border rounded-xl p-6 bg-card shadow-sm flex flex-col">
            <h3 className="font-semibold text-lg mb-2">Top Products</h3>
            <p className="text-sm text-muted-foreground mb-4">By quantity sold</p>
            
            {data.topProducts && data.topProducts.length > 0 ? (
              <div className="flex-1 flex flex-col justify-center">
                <div className="aspect-square w-full mx-auto max-w-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.topProducts}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                      >
                        {data.topProducts.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [`${value} units`, undefined]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-6 space-y-3 flex-1 overflow-y-auto pr-2">
                  {data.topProducts.map((prod: any, index: number) => (
                    <div key={prod.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="truncate" title={prod.name}>{prod.name}</span>
                      </div>
                      <span className="font-semibold shrink-0 ml-2">{prod.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground border-dashed border rounded-lg p-4 text-center text-sm">
                No product data available
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
