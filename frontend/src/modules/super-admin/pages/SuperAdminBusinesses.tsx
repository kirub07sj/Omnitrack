import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Building2, 
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  User,
  Lock,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function SuperAdminBusinesses() {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [formError, setFormError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'business' | 'owner'>('business');
  
  // Business Profile Form State
  const [businessName, setBusinessName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [plan, setPlan] = useState('pro');
  const [durationDays, setDurationDays] = useState(30);

  // Owner Info Form State
  const [ownerFirstName, setOwnerFirstName] = useState('');
  const [ownerLastName, setOwnerLastName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerUsername, setOwnerUsername] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');

  useEffect(() => {
    fetchTenants();
  }, []);

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

  const resetForm = () => {
    setBusinessName('');
    setBusinessEmail('');
    setBusinessPhone('');
    setBusinessAddress('');
    setOwnerFirstName('');
    setOwnerLastName('');
    setOwnerEmail('');
    setOwnerUsername('');
    setOwnerPassword('');
    setPlan('pro');
    setDurationDays(30);
    setActiveTab('business');
    setFormError('');
  };

  const handleNextToOwner = () => {
    if (!businessName.trim()) {
      setFormError('Please enter the business name before continuing.');
      return;
    }
    setFormError('');
    setActiveTab('owner');
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!businessName.trim()) {
      setActiveTab('business');
      setFormError('Business name is required.');
      return;
    }

    if (!ownerFirstName.trim() || !ownerLastName.trim()) {
      setActiveTab('owner');
      setFormError('Owner first and last name are required.');
      return;
    }

    if (!ownerEmail.trim()) {
      setActiveTab('owner');
      setFormError('Owner email is required.');
      return;
    }

    if (!ownerUsername.trim()) {
      setActiveTab('owner');
      setFormError('Owner username is required.');
      return;
    }

    if (!ownerPassword) {
      setActiveTab('owner');
      setFormError('Owner initial password is required.');
      return;
    }

    setIsCreating(true);
    try {
      const res = await apiFetch('/api/super-admin/tenants', {
        method: 'POST',
        body: JSON.stringify({
          businessName: businessName.trim(),
          businessEmail: businessEmail.trim() || undefined,
          businessPhone: businessPhone.trim() || undefined,
          businessAddress: businessAddress.trim() || undefined,
          ownerFirstName: ownerFirstName.trim(),
          ownerLastName: ownerLastName.trim(),
          ownerEmail: ownerEmail.trim(),
          ownerUsername: ownerUsername.trim(),
          ownerPassword,
          plan,
          durationDays: parseInt(durationDays.toString(), 10) || 30
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        resetForm();
        setDialogOpen(false);
        fetchTenants();
      } else {
        setFormError(data.message || 'Error creating tenant');
      }
    } catch (err) {
      console.error(err);
      setFormError('An error occurred connecting to the backend.');
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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tenant Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage cloud businesses, owners, and subscriptions.</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm">
              <Plus className="w-4 h-4" />
              New Business
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-xl font-bold text-gray-900">Provision New Tenant</DialogTitle>
            </DialogHeader>

            <div className="flex border-b border-gray-200 my-2">
              <button
                type="button"
                onClick={() => setActiveTab('business')}
                className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === 'business'
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50/70 rounded-t-lg'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  activeTab === 'business' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>1</div>
                <Building2 className="w-4 h-4" />
                <span>Business Profile</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('owner')}
                className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === 'owner'
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50/70 rounded-t-lg'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  activeTab === 'owner' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>2</div>
                <User className="w-4 h-4" />
                <span>Owner Info</span>
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl flex items-start gap-2.5 text-xs mt-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateTenant} className="space-y-4 pt-2">
              {activeTab === 'business' && (
                <div className="space-y-4 animate-in fade-in-50 duration-200">
                  <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100 mb-3">
                    <h3 className="text-sm font-semibold text-emerald-950 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-600" /> Business Details
                    </h3>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <Label className="text-xs font-medium text-gray-700">Business Name *</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input required value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Grand Hotel & Restaurant" className="pl-10 h-10 text-sm" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                      <Label className="text-xs font-medium text-gray-700">Business Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input type="email" value={businessEmail} onChange={e => setBusinessEmail(e.target.value)} placeholder="contact@hotel.com" className="pl-10 h-10 text-sm" />
                      </div>
                    </div>
                    <div className="space-y-1.5 text-left">
                      <Label className="text-xs font-medium text-gray-700">Business Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input value={businessPhone} onChange={e => setBusinessPhone(e.target.value)} placeholder="+1 234 567 8900" className="pl-10 h-10 text-sm" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <Label className="text-xs font-medium text-gray-700">Business Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input value={businessAddress} onChange={e => setBusinessAddress(e.target.value)} placeholder="123 Main St, City" className="pl-10 h-10 text-sm" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                    <div className="space-y-1.5 text-left">
                      <Label className="text-xs font-medium text-gray-700">Subscription Plan</Label>
                      <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" value={plan} onChange={e => setPlan(e.target.value)}>
                        <option value="free">Free Trial</option>
                        <option value="pro">Pro</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                    </div>
                    <div className="space-y-1.5 text-left">
                      <Label className="text-xs font-medium text-gray-700">Duration (Days)</Label>
                      <Input type="number" required min="1" value={durationDays} onChange={e => setDurationDays(Number(e.target.value))} className="h-10 text-sm" />
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end">
                    <Button type="button" onClick={handleNextToOwner} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                      Next: Owner Info <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'owner' && (
                <div className="space-y-4 animate-in fade-in-50 duration-200">
                  <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100 mb-3">
                    <h3 className="text-sm font-semibold text-emerald-950 flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-600" /> Owner Account & POS Credentials
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                      <Label className="text-xs font-medium text-gray-700">First Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input required value={ownerFirstName} onChange={e => setOwnerFirstName(e.target.value)} placeholder="John" className="pl-10 h-10 text-sm" />
                      </div>
                    </div>
                    <div className="space-y-1.5 text-left">
                      <Label className="text-xs font-medium text-gray-700">Last Name *</Label>
                      <Input required value={ownerLastName} onChange={e => setOwnerLastName(e.target.value)} placeholder="Doe" className="h-10 text-sm" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                      <Label className="text-xs font-medium text-gray-700">Owner Email (Account) *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input type="email" required value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} placeholder="owner@hotel.com" className="pl-10 h-10 text-sm" />
                      </div>
                    </div>
                    <div className="space-y-1.5 text-left">
                      <Label className="text-xs font-medium text-gray-700">Owner Username (POS) *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input type="text" required value={ownerUsername} onChange={e => setOwnerUsername(e.target.value)} placeholder="admin" className="pl-10 h-10 text-sm" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <Label className="text-xs font-medium text-gray-700">Initial Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input type="text" required value={ownerPassword} onChange={e => setOwnerPassword(e.target.value)} placeholder="TempPassword123" className="pl-10 h-10 text-sm font-mono" />
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                    <Button type="button" variant="outline" onClick={() => setActiveTab('business')} className="gap-2 text-gray-600">
                      <ArrowLeft className="w-4 h-4" /> Back to Business
                    </Button>
                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm" disabled={isCreating}>
                      {isCreating ? <><Loader2 className="w-4 h-4 animate-spin" /> Provisioning...</> : <><CheckCircle2 className="w-4 h-4" /> Provision Tenant</>}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/80 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Business Profile</th>
                <th className="px-6 py-4">Owner Info</th>
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
                        <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          {tenant.business.name}
                        </p>
                        {tenant.business.email && (
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-gray-400" />
                            {tenant.business.email}
                          </p>
                        )}
                        {tenant.business.phone && (
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {tenant.business.phone}
                          </p>
                        )}
                        {tenant.business.address && (
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            {tenant.business.address}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">No Business</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {tenant.account ? (
                      <div>
                        <p className="font-medium text-gray-900 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          {tenant.account.first_name} {tenant.account.last_name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          <span className="text-gray-400 font-medium">Email:</span> {tenant.account.email}
                        </p>
                        {tenant.business?.owner?.username && (
                          <p className="text-xs text-emerald-700 font-mono mt-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 w-fit">
                            POS User: @{tenant.business.owner.username}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md font-semibold text-xs">
                      {tenant.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {tenant.status === 'active' || tenant.status === 'trial' ? (
                      <div className="flex items-center gap-1.5 text-emerald-700 font-medium text-xs bg-emerald-50 px-2.5 py-1 rounded-md w-fit border border-emerald-100">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="capitalize">{tenant.status}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-rose-600 font-medium text-xs bg-rose-50 px-2.5 py-1 rounded-md w-fit border border-rose-100">
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
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 font-medium text-xs"
                      onClick={() => handleExtendSubscription(tenant.subscription_id)}
                    >
                      +30 Days
                    </Button>
                    {tenant.business && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-emerald-700"
                        onClick={() => navigate(`/super-admin/businesses/${tenant.business.id}`)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    )}
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
    </div>
  );
}
