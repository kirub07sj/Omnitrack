import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Users, Utensils, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function TableManagementPage() {
  const { currentUser } = useAppStore();
  const [tables, setTables] = useState<any[]>([]);
  const [waiters, setWaiters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [setupLoading, setSetupLoading] = useState(false);
  const [tableCount, setTableCount] = useState<string>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (currentUser?.business_id) {
      fetchData();
    }
  }, [currentUser]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tablesRes, employeesRes] = await Promise.all([
        fetch(`/api/tables?business_id=${currentUser?.business_id}`),
        fetch(`/api/employees?business_id=${currentUser?.business_id}`)
      ]);
      
      const tablesData = await tablesRes.json();
      const employeesData = await employeesRes.json();
      
      setTables(tablesData);
      setTableCount(tablesData.length > 0 ? tablesData.length.toString() : '');
      
      const filteredWaiters = employeesData.filter((emp: any) => 
        emp.position?.toLowerCase().includes('waiter') || 
        emp.position?.toLowerCase().includes('waitress')
      );
      setWaiters(filteredWaiters);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async () => {
    if (!tableCount || isNaN(Number(tableCount))) return;
    
    try {
      setSetupLoading(true);
      setError('');
      setSuccess('');
      
      const res = await fetch('/api/tables/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: currentUser?.business_id,
          count: tableCount
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setTables(data);
        setSuccess(`Successfully configured ${data.length} tables.`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error('Failed to configure tables');
      }
    } catch (err) {
      setError('Failed to configure tables');
    } finally {
      setSetupLoading(false);
    }
  };

  const assignWaiter = async (tableId: string, waiterId: string) => {
    try {
      const res = await fetch(`/api/tables/${tableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waiter_id: waiterId || null })
      });
      
      if (res.ok) {
        const updatedTable = await res.json();
        setTables(prev => prev.map(t => t.id === tableId ? { ...t, waiter_id: updatedTable.waiter_id } : t));
      }
    } catch (err) {
      console.error('Failed to assign waiter', err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Table Management</h1>
        <p className="text-muted-foreground mt-2">
          Configure your restaurant layout and assign waiters to tables.
        </p>
      </div>
      
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Table Setup</h2>
        <div className="flex flex-col sm:flex-row items-end gap-4">
          <div className="flex-1 max-w-sm space-y-2">
            <label className="text-sm font-medium">Number of Tables</label>
            <Input 
              type="number" 
              min="1" max="100"
              value={tableCount} 
              onChange={(e) => setTableCount(e.target.value)} 
              placeholder="e.g. 15"
            />
          </div>
          <Button onClick={handleSetup} disabled={setupLoading || !tableCount}>
            {setupLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Utensils className="w-4 h-4 mr-2" />}
            Generate Tables
          </Button>
        </div>
        {error && <p className="text-destructive text-sm mt-3">{error}</p>}
        {success && <p className="text-emerald-600 flex items-center text-sm mt-3"><CheckCircle2 className="w-4 h-4 mr-1" /> {success}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.map(table => (
          <div key={table.id} className="bg-card border border-border rounded-xl p-5 flex flex-col items-center hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-3">
              <span className="text-xl font-bold text-primary">{table.table_number.replace('Table ', '')}</span>
            </div>
            <h3 className="font-semibold text-lg mb-1">{table.table_number}</h3>
            
            <div className="w-full mt-4 space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center">
                <Users className="w-3 h-3 mr-1" /> Assign Waiter
              </label>
              <select 
                className="w-full bg-background border border-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                value={table.waiter_id || ''}
                onChange={(e) => assignWaiter(table.id, e.target.value)}
              >
                <option value="">-- Unassigned --</option>
                {waiters.map(waiter => (
                  <option key={waiter.id} value={waiter.id}>
                    {waiter.first_name} {waiter.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
        {tables.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
            No tables generated yet. Enter a number above to start.
          </div>
        )}
      </div>
    </div>
  );
}
