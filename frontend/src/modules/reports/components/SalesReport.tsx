import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Search, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { useSettings } from '@/hooks/useSettings';

export function SalesReport({ dateRange, refreshTrigger = 0 }: { dateRange: { startDate: string, endDate: string }, refreshTrigger?: number }) {
  const { currency } = useSettings();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams(dateRange as any).toString();
        const res = await fetch(`/api/reports/sales?${query}`);
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
    fetchData();
  }, [dateRange, refreshTrigger]);

  const filteredData = data.filter(item => 
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.cashier?.first_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const handleExport = () => {
    if (filteredData.length === 0) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Sale ID,Cashier,Subtotal,Tax,Discount,Total\n"
      + sortedData.map(row => {
          return `${format(new Date(row.created_at), 'yyyy-MM-dd HH:mm')},${row.id},${row.cashier?.first_name || 'Unknown'},${row.subtotal},${row.tax},${row.discount || 0},${row.total}`;
      }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Sales_Report_${dateRange.startDate}_to_${dateRange.endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 gap-4">
        <div className="space-y-1">
          <CardTitle>Sales Report</CardTitle>
          <CardDescription>Detailed record of all completed sales.</CardDescription>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search sales..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Export CSV</span></Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-y">
              <tr>
                <th className="px-6 py-4 font-medium">
                  <div className="flex items-center gap-1 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}>
                    Date <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-6 py-4 font-medium">Sale ID</th>
                <th className="px-6 py-4 font-medium">Cashier</th>
                <th className="px-6 py-4 font-medium text-right">Subtotal</th>
                <th className="px-6 py-4 font-medium text-right">Tax</th>
                <th className="px-6 py-4 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-muted-foreground">Loading Sales Data...</td>
                </tr>
              ) : sortedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-muted-foreground">No sales found for this period.</td>
                </tr>
              ) : (
                sortedData.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">{format(new Date(row.created_at), 'MMM dd, yyyy HH:mm')}</td>
                    <td className="px-6 py-4 font-medium truncate max-w-[150px]" title={row.id}>{row.id}</td>
                    <td className="px-6 py-4">{row.cashier?.first_name} {row.cashier?.last_name}</td>
                    <td className="px-6 py-4 text-right">{parseFloat(row.subtotal).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">{parseFloat(row.tax).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600">{parseFloat(row.total).toLocaleString()} {currency}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
