import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/api';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  LogOut, 
  Plus,
  Loader2,
  CalendarClock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import logo from '@/assets/logo.png';

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAppStore();
  
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  // New Tenant Form
  const [newBusinessName, setNewBusinessName] = useState('');
  const [ownerFirstName, setOwnerFirstName] = useState('');
  const [ownerLastName, setOwnerLastName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [plan, setPlan] = useState('pro');
  const [durationDays, setDurationDays] = useState(30);

  useEffect(() => {
    if (!currentUser?.is_super_admin) {
      navigate('/');
    } else {
      fetchTenants();
    }
  }, [currentUser, navigate]);

  const fetchTenants = async () => {
    try {
      const res = await apiFetch('/api/super-admin/tenants');
      const data = await res.json();
      if (data.success) {
        setTenants(data.tenants);
      }
    } catch (err) {
      console.error('Failed to fetch tenants', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const res = await apiFetch('/api/super-admin/tenants', {
        method: 'POST',
        body: JSON.stringify({
          businessName: newBusinessName,
          ownerFirstName,
          ownerLastName,
          ownerEmail,
          ownerPassword,
          plan,
          durationDays: parseInt(durationDays.toString(), 10)
        })
      });
      const data = await res.json();
      if (data.success) {
        // Reset form
        setNewBusinessName('');
        setOwnerFirstName('');
        setOwnerLastName('');
        setOwnerEmail('');
        setOwnerPassword('');
        setDurationDays(30);
        // Refresh list
        fetchTenants();
      } else {
        alert(data.message || 'Error creating tenant');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  const handleExtendSubscription = async (id: string) => {
    try {
      const res = await apiFetch(`/api/super-admin/tenants/${id}/subscription`, {
        method: 'PUT',
        body: JSON.stringify({ addDays: 30 })
      });
      if (res.ok) fetchTenants();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <img src={logo} alt="Logo" className="w-7 h-7 object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">Omnitrack</h1>
            <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Super Admin Console
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-600">
            {currentUser?.email}
          </span>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tenant Management</h2>
            <p className="text-sm text-gray-500 mt-1">Manage cloud businesses, owners, and subscriptions.</p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm">
                <Plus className="w-4 h-4" />
                New Business
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Business Tenant</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTenant} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <Input required value={newBusinessName} onChange={e => setNewBusinessName(e.target.value)} placeholder="Acme Hotel & Restaurant" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Owner First Name</Label>
                    <Input required value={ownerFirstName} onChange={e => setOwnerFirstName(e.target.value)} placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label>Owner Last Name</Label>
                    <Input required value={ownerLastName} onChange={e => setOwnerLastName(e.target.value)} placeholder="Doe" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Owner Email (Login Username)</Label>
                  <Input type="email" required value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} placeholder="owner@acme.com" />
                </div>

                <div className="space-y-2">
                  <Label>Initial Password</Label>
                  <Input type="text" required value={ownerPassword} onChange={e => setOwnerPassword(e.target.value)} placeholder="TempPass123" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Plan</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={plan} 
                      onChange={e => setPlan(e.target.value)}
                    >
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Initial Duration (Days)</Label>
                    <Input type="number" required min="1" value={durationDays} onChange={e => setDurationDays(Number(e.target.value))} />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isCreating}>
                  {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Provision Tenant'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Businesses</p>
              <p className="text-2xl font-bold text-gray-900">{tenants.filter(t => t.business).length}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Accounts</p>
              <p className="text-2xl font-bold text-gray-900">{tenants.length}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
              <CalendarClock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Active Subscriptions</p>
              <p className="text-2xl font-bold text-gray-900">
                {tenants.filter(t => t.status === 'active' || t.status === 'trial').length}
              </p>
            </div>
          </div>
        </div>

        {/* Tenants Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/80 text-gray-600 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Business</th>
                  <th className="px-6 py-4">Owner</th>
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Expiry</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tenants.map((tenant) => (
                  <tr key={tenant.subscription_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      {tenant.business ? (
                        <div>
                          <p className="font-semibold text-gray-900">{tenant.business.name}</p>
                          <p className="text-xs text-gray-500">ID: {tenant.business.id.split('-')[0]}...</p>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No Business</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {tenant.account ? (
                        <div>
                          <p className="font-medium text-gray-900">
                            {tenant.account.first_name} {tenant.account.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{tenant.account.email}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md font-medium text-xs">
                        {tenant.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {tenant.status === 'active' || tenant.status === 'trial' ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-medium text-xs bg-emerald-50 px-2.5 py-1 rounded-md w-fit">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span className="capitalize">{tenant.status}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-rose-600 font-medium text-xs bg-rose-50 px-2.5 py-1 rounded-md w-fit">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span className="capitalize">{tenant.status}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 font-medium">
                        {tenant.expires_at ? new Date(tenant.expires_at).toLocaleDateString() : 'Never'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
                        onClick={() => handleExtendSubscription(tenant.subscription_id)}
                      >
                        +30 Days
                      </Button>
                    </td>
                  </tr>
                ))}
                
                {tenants.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No tenants found. Click "New Business" to provision your first customer.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
