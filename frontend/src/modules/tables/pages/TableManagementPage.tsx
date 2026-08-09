import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Loader2, Users, Utensils, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function TableManagementPage() {
  const { currentUser } = useAppStore();
  const [tables, setTables] = useState<any[]>([]);
  const [waiters, setWaiters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [setupLoading, setSetupLoading] = useState(false);
  const [tableCount, setTableCount] = useState<string>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [selectedWaiter, setSelectedWaiter] = useState<string>('');

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
      
      const sortedTables = Array.isArray(tablesData) ? [...tablesData].sort((a, b) => {
        const numA = parseInt(String(a.table_number || '').replace(/\D/g, '')) || 0;
        const numB = parseInt(String(b.table_number || '').replace(/\D/g, '')) || 0;
        return numA - numB;
      }) : tablesData;
      
      setTables(sortedTables);
      setTableCount(sortedTables.length > 0 ? sortedTables.length.toString() : '');
      
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
        const sortedData = Array.isArray(data) ? [...data].sort((a: any, b: any) => {
          const numA = parseInt(String(a.table_number || '').replace(/\D/g, '')) || 0;
          const numB = parseInt(String(b.table_number || '').replace(/\D/g, '')) || 0;
          return numA - numB;
        }) : data;
        setTables(sortedData);
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

  const toggleTableSelection = (tableId: string) => {
    setSelectedTables(prev => 
      prev.includes(tableId) ? prev.filter(id => id !== tableId) : [...prev, tableId]
    );
  };

  const handleBulkAssign = async () => {
    if (selectedTables.length === 0) return;
    
    try {
      setSetupLoading(true);
      await Promise.all(
        selectedTables.map(tableId =>
          fetch(`/api/tables/${tableId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ waiter_id: selectedWaiter || null })
          })
        )
      );
      
      setTables(prev => prev.map(t => 
        selectedTables.includes(t.id) ? { ...t, waiter_id: selectedWaiter || null } : t
      ));
      
      setIsAssignModalOpen(false);
      setSelectedTables([]);
      setSelectedWaiter('');
      setSuccess('Waiters assigned successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to assign waiters');
    } finally {
      setSetupLoading(false);
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
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <Button onClick={handleSetup} disabled={setupLoading || !tableCount}>
            {setupLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Utensils className="w-4 h-4 mr-2" />}
            Generate Tables
          </Button>
          <div className="flex-1 flex justify-end">
            <Button variant="outline" onClick={() => setIsAssignModalOpen(true)} className="border-primary text-primary hover:bg-primary/10">
              <Users className="w-4 h-4 mr-2" /> Assign Waiter
            </Button>
          </div>
        </div>
        
        {/* Fixed Notifications */}
        {(error || success) && (
          <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 animate-in slide-in-from-top-5">
            {error && (
              <div className="bg-destructive text-destructive-foreground px-4 py-3 rounded-xl shadow-lg font-medium text-sm flex items-center">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg font-medium text-sm flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                {success}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.map(table => {
          const assignedWaiter = waiters.find(w => w.id === table.waiter_id);
          return (
            <div key={table.id} className={`border rounded-xl p-5 flex flex-col items-center hover:shadow-md transition-all duration-200 ${table.waiter_id ? 'bg-muted/60 border-primary/20' : 'bg-card border-border'}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${table.waiter_id ? 'bg-primary/20' : 'bg-primary/10'}`}>
                <span className="text-xl font-bold text-primary">{table.table_number.replace('Table ', '')}</span>
              </div>
              <h3 className="font-semibold text-lg mb-1">{table.table_number}</h3>
              {assignedWaiter ? (
                <div className="text-sm text-primary font-medium mt-2 flex items-center">
                  <Users className="w-3 h-3 mr-1" /> {assignedWaiter.first_name} {assignedWaiter.last_name}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground mt-2">Unassigned</div>
              )}
            </div>
          );
        })}
        {tables.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
            No tables generated yet. Enter a number above to start.
          </div>
        )}
      </div>

      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="max-w-3xl bg-card border-border">
          <DialogHeader>
            <DialogTitle>Assign Tables to Waiter</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Waiter</label>
              <select 
                className="w-full bg-background border border-border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                value={selectedWaiter}
                onChange={(e) => setSelectedWaiter(e.target.value)}
              >
                <option value="">-- Unassigned (Clear Waiter) --</option>
                {waiters.map(waiter => (
                  <option key={waiter.id} value={waiter.id}>
                    {waiter.first_name} {waiter.last_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex justify-between">
                <span>Select Tables</span>
                <span className="text-primary">{selectedTables.length} selected</span>
              </label>
              <div className="bg-muted/30 p-4 rounded-xl border border-border">
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 max-h-[40vh] overflow-y-auto p-1">
                  {tables.map(table => {
                    const isSelected = selectedTables.includes(table.id);
                    const isAssigned = !!table.waiter_id;
                    const assignedWaiter = waiters.find(w => w.id === table.waiter_id);
                    
                    return (
                      <button
                        key={table.id}
                        onClick={() => toggleTableSelection(table.id)}
                        className={`
                          relative flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all duration-200
                          ${isSelected ? 'border-primary bg-primary/10 scale-105' : 
                            isAssigned ? 'border-transparent bg-muted/60 hover:bg-muted' : 'border-border bg-card hover:border-primary/50'}
                        `}
                        title={assignedWaiter ? `Assigned to ${assignedWaiter.first_name}` : 'Unassigned'}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 
                          ${isSelected ? 'bg-primary text-primary-foreground' : 
                            isAssigned ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          <span className="text-sm font-bold">{table.table_number.replace('Table ', '')}</span>
                        </div>
                        {isAssigned && !isSelected && (
                          <div className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full shadow-sm"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>Cancel</Button>
            <Button onClick={handleBulkAssign} disabled={selectedTables.length === 0 || setupLoading}>
              {setupLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Apply Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
