import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function InventoryReport({ refreshTrigger = 0 }: { refreshTrigger?: number }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Note: Inventory is generally a snapshot of current state, so date filtering might not apply to stock levels
  // unless we're tracking historical snapshots, but we'll fetch current stock for this report.

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/reports/inventory`);
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
  }, [refreshTrigger]);

  const filteredData = data.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleExport = () => {
    if (filteredData.length === 0) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Item Name,SKU,Unit,Quantity,Cost Per Unit,Total Value,Status\n"
      + filteredData.map(row => {
          return `${row.name},${row.sku || ''},${row.unit},${row.quantity},${row.cost_per_unit || 0},${(row.quantity * (row.cost_per_unit || 0))},${row.status}`;
      }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Inventory_Valuation_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 gap-4">
        <div className="space-y-1">
          <CardTitle>Inventory Report</CardTitle>
          <CardDescription>Current stock levels and total valuation.</CardDescription>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search item or SKU..."
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
                <th className="px-6 py-4 font-medium">Item Name</th>
                <th className="px-6 py-4 font-medium">SKU</th>
                <th className="px-6 py-4 font-medium text-right">Qty</th>
                <th className="px-6 py-4 font-medium text-right">Cost/Unit</th>
                <th className="px-6 py-4 font-medium text-right">Total Value</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-muted-foreground">Loading Inventory...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-muted-foreground">No inventory items found.</td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{row.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{row.sku || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      {parseFloat(row.quantity).toLocaleString()} <span className="text-xs text-muted-foreground ml-1">{row.unit}</span>
                    </td>
                    <td className="px-6 py-4 text-right">{parseFloat(row.cost_per_unit || '0').toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-bold text-gray-700">
                      {(parseFloat(row.quantity) * parseFloat(row.cost_per_unit || '0')).toLocaleString()} ETB
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === 'Active' ? 'bg-primary/20 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredData.length > 0 && (
              <tfoot className="bg-muted/50 font-bold border-t">
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-right">Total Inventory Value:</td>
                  <td className="px-6 py-4 text-right text-emerald-700">
                    {filteredData.reduce((acc, row) => acc + (parseFloat(row.quantity) * parseFloat(row.cost_per_unit || '0')), 0).toLocaleString()} ETB
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
