import { useState, useEffect } from 'react';
import { z } from 'zod';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import SuperAdminBusinessDetails from './SuperAdminBusinessDetails';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
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
  ArrowLeft,
  Gift,
  CreditCard,
  CalendarDays
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const tenantSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  ownerFirstName: z.string().min(1, "Owner first name is required"),
  ownerLastName: z.string().min(1, "Owner last name is required"),
  ownerEmail: z.string().email("Invalid email for owner"),
  ownerUsername: z.string().min(3, "Owner username must be at least 3 characters"),
  ownerPassword: z.string().min(6, "Initial password must be at least 6 characters")
});

function planLabel(plan?: string) {
  if (plan === 'trial' || plan === 'free') return 'Free Trial';
  if (plan === 'monthly' || plan === 'pro') return 'Paid Monthly';
  return plan || '—';
}

function TenantsTableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-emerald-100 bg-emerald-50/50">
        <Skeleton className="h-4 w-40 bg-emerald-100" />
      </div>
      <div className="divide-y divide-emerald-50">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="px-6 py-4 grid grid-cols-6 gap-4 items-center">
            <div className="space-y-2 col-span-1">
              <Skeleton className="h-4 w-36 bg-emerald-100" />
              <Skeleton className="h-3 w-24 bg-emerald-50" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28 bg-emerald-50" />
              <Skeleton className="h-3 w-32 bg-emerald-50" />
            </div>
            <Skeleton className="h-6 w-20 rounded-md bg-emerald-50" />
            <Skeleton className="h-6 w-16 rounded-md bg-emerald-50" />
            <Skeleton className="h-4 w-24 bg-emerald-50" />
            <Skeleton className="h-8 w-20 ml-auto rounded-md bg-emerald-50" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SuperAdminBusinesses() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formError, setFormError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'business' | 'owner'>('business');

  const [businessName, setBusinessName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [plan, setPlan] = useState<'trial' | 'monthly'>('trial');

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
    setPlan('trial');
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
    setIsCreating(true);

    const validation = tenantSchema.safeParse({ businessName, ownerFirstName, ownerLastName, ownerEmail, ownerUsername, ownerPassword });
    if (!validation.success) {
      setFormError(validation.error.errors[0].message);
      setIsCreating(false);
      return;
    }

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
          plan
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
            <Button className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2 shadow-sm">
              <Plus className="w-4 h-4" />
              New Business
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-hidden p-0 gap-0 border-emerald-100 [&>button]:text-white [&>button]:opacity-80 [&>button]:hover:opacity-100 [&>button]:hover:bg-emerald-800/60 [&>button]:rounded-md [&>button]:right-5 [&>button]:top-5">
            <DialogHeader className="bg-gradient-to-r from-emerald-900 via-emerald-950 to-emerald-900 px-6 py-5 text-left space-y-1">
              <DialogTitle className="text-xl font-bold text-white tracking-tight">Provision New Tenant</DialogTitle>
              <DialogDescription className="text-emerald-200/80 text-sm">
                Create a business, owner account, and license in one step.
              </DialogDescription>
            </DialogHeader>

            <div className="px-6 pt-4 pb-6 overflow-y-auto max-h-[calc(90vh-96px)] bg-white">
              <div className="flex border-b border-emerald-100 mb-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('business')}
                  className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
                    activeTab === 'business'
                      ? 'border-emerald-700 text-emerald-800 bg-emerald-50/70 rounded-t-lg'
                      : 'border-transparent text-gray-500 hover:text-emerald-800 hover:border-emerald-200'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    activeTab === 'business' ? 'bg-emerald-700 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>1</div>
                  <Building2 className="w-4 h-4" />
                  <span>Business Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('owner')}
                  className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
                    activeTab === 'owner'
                      ? 'border-emerald-700 text-emerald-800 bg-emerald-50/70 rounded-t-lg'
                      : 'border-transparent text-gray-500 hover:text-emerald-800 hover:border-emerald-200'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    activeTab === 'owner' ? 'bg-emerald-700 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>2</div>
                  <User className="w-4 h-4" />
                  <span>Owner Info</span>
                </button>
              </div>

              {formError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl flex items-start gap-2.5 text-xs mb-4">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreateTenant} className="space-y-4">
                {activeTab === 'business' && (
                  <div className="space-y-4 animate-in fade-in-50 duration-200">
                    <div className="space-y-1.5 text-left">
                      <Label className="text-xs font-medium text-gray-700">Business Name *</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600/70" />
                        <Input required value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Grand Hotel & Restaurant" className="pl-10 h-10 text-sm border-emerald-100 focus-visible:ring-emerald-600" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 text-left">
                        <Label className="text-xs font-medium text-gray-700">Business Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600/70" />
                          <Input type="email" value={businessEmail} onChange={e => setBusinessEmail(e.target.value)} placeholder="contact@hotel.com" className="pl-10 h-10 text-sm border-emerald-100 focus-visible:ring-emerald-600" />
                        </div>
                      </div>
                      <div className="space-y-1.5 text-left">
                        <Label className="text-xs font-medium text-gray-700">Business Phone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600/70" />
                          <Input value={businessPhone} onChange={e => setBusinessPhone(e.target.value)} placeholder="+1 234 567 8900" className="pl-10 h-10 text-sm border-emerald-100 focus-visible:ring-emerald-600" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <Label className="text-xs font-medium text-gray-700">Business Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600/70" />
                        <Input value={businessAddress} onChange={e => setBusinessAddress(e.target.value)} placeholder="123 Main St, City" className="pl-10 h-10 text-sm border-emerald-100 focus-visible:ring-emerald-600" />
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-emerald-50">
                      <Label className="text-xs font-medium text-gray-700">License</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPlan('trial')}
                          className={`text-left rounded-xl border p-4 transition-all ${
                            plan === 'trial'
                              ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600/20'
                              : 'border-emerald-100 bg-white hover:border-emerald-300 hover:bg-emerald-50/40'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${
                              plan === 'trial' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              <Gift className="w-4 h-4" />
                            </span>
                            <span className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800 bg-white border border-emerald-100 px-2 py-0.5 rounded-full">
                              14 days
                            </span>
                          </div>
                          <p className="font-semibold text-emerald-950">Free Trial</p>
                          <p className="text-xs text-gray-500 mt-1">Full access for two weeks. Convert to monthly anytime.</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPlan('monthly')}
                          className={`text-left rounded-xl border p-4 transition-all ${
                            plan === 'monthly'
                              ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600/20'
                              : 'border-emerald-100 bg-white hover:border-emerald-300 hover:bg-emerald-50/40'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${
                              plan === 'monthly' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              <CreditCard className="w-4 h-4" />
                            </span>
                            <span className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800 bg-white border border-emerald-100 px-2 py-0.5 rounded-full">
                              30 days
                            </span>
                          </div>
                          <p className="font-semibold text-emerald-950">Paid Monthly</p>
                          <p className="text-xs text-gray-500 mt-1">Active paid license. Renews on the expiry date.</p>
                        </button>
                      </div>
                    </div>

                    <div className="pt-3 flex justify-end">
                      <Button type="button" onClick={handleNextToOwner} className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2">
                        Next: Owner Info <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === 'owner' && (
                  <div className="space-y-4 animate-in fade-in-50 duration-200">
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <h3 className="text-sm font-semibold text-emerald-950 flex items-center gap-2">
                        <User className="w-4 h-4 text-emerald-700" /> Owner Account & POS Credentials
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 text-left">
                        <Label className="text-xs font-medium text-gray-700">First Name *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600/70" />
                          <Input required value={ownerFirstName} onChange={e => setOwnerFirstName(e.target.value)} placeholder="John" className="pl-10 h-10 text-sm border-emerald-100 focus-visible:ring-emerald-600" />
                        </div>
                      </div>
                      <div className="space-y-1.5 text-left">
                        <Label className="text-xs font-medium text-gray-700">Last Name *</Label>
                        <Input required value={ownerLastName} onChange={e => setOwnerLastName(e.target.value)} placeholder="Doe" className="h-10 text-sm border-emerald-100 focus-visible:ring-emerald-600" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 text-left">
                        <Label className="text-xs font-medium text-gray-700">Owner Email (Account) *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600/70" />
                          <Input type="email" required value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} placeholder="owner@hotel.com" className="pl-10 h-10 text-sm border-emerald-100 focus-visible:ring-emerald-600" />
                        </div>
                      </div>
                      <div className="space-y-1.5 text-left">
                        <Label className="text-xs font-medium text-gray-700">Owner Username (POS) *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600/70" />
                          <Input type="text" required value={ownerUsername} onChange={e => setOwnerUsername(e.target.value)} placeholder="admin" className="pl-10 h-10 text-sm border-emerald-100 focus-visible:ring-emerald-600" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <Label className="text-xs font-medium text-gray-700">Initial Password *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600/70" />
                        <Input type="text" required value={ownerPassword} onChange={e => setOwnerPassword(e.target.value)} placeholder="TempPassword123" className="pl-10 h-10 text-sm font-mono border-emerald-100 focus-visible:ring-emerald-600" />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                      <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                      {plan === 'trial'
                        ? 'This tenant will start on a 14-day free trial.'
                        : 'This tenant will start on a 30-day paid monthly license.'}
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-emerald-50">
                      <Button type="button" variant="outline" onClick={() => setActiveTab('business')} className="gap-2 text-emerald-900 border-emerald-200 hover:bg-emerald-50">
                        <ArrowLeft className="w-4 h-4" /> Back to Business
                      </Button>
                      <Button type="submit" className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2 shadow-sm" disabled={isCreating}>
                        {isCreating ? <><Loader2 className="w-4 h-4 animate-spin" /> Provisioning...</> : <><CheckCircle2 className="w-4 h-4" /> Provision Tenant</>}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <TenantsTableSkeleton />
      ) : (
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-emerald-50/80 text-emerald-900 font-medium border-b border-emerald-100">
                <tr>
                  <th className="px-6 py-4">Business Profile</th>
                  <th className="px-6 py-4">Owner Info</th>
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Expiry</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50">
                {tenants.map((tenant) => (
                  <tr key={tenant.subscription_id} className="hover:bg-emerald-50/40 transition-colors">
                    <td className="px-6 py-4">
                      {tenant.business ? (
                        <div>
                          <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
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
                            <User className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            {tenant.account.first_name} {tenant.account.last_name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            <span className="text-gray-400 font-medium">Email:</span> {tenant.account.email}
                          </p>
                          {tenant.business?.owner?.username && (
                            <p className="text-xs text-emerald-800 font-mono mt-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 w-fit">
                              POS User: @{tenant.business.owner.username}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-md font-semibold text-xs">
                        {planLabel(tenant.plan)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {tenant.status === 'active' || tenant.status === 'trial' ? (
                        <div className="flex items-center gap-1.5 text-emerald-800 font-medium text-xs bg-emerald-50 px-2.5 py-1 rounded-md w-fit border border-emerald-100">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
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
                        className="text-emerald-800 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-900 font-medium text-xs"
                        onClick={() => handleExtendSubscription(tenant.subscription_id)}
                      >
                        +30 Days
                      </Button>
                      {tenant.business && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-emerald-800 hover:bg-emerald-50"
                          onClick={() => setSelectedBusinessId(tenant.business.id)}
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
      )}

      <Dialog open={!!selectedBusinessId} onOpenChange={(open) => !open && setSelectedBusinessId(null)}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden gap-0 border-emerald-100 bg-white max-h-[90vh] [&>button]:text-white [&>button]:opacity-80 [&>button]:hover:opacity-100 [&>button]:hover:bg-emerald-800/60 [&>button]:rounded-md [&>button]:right-5 [&>button]:top-5">
          <DialogHeader className="bg-gradient-to-r from-emerald-900 via-emerald-950 to-emerald-900 px-6 py-5 text-left space-y-1">
            <DialogTitle className="text-lg font-bold text-white tracking-tight">Business License</DialogTitle>
            <DialogDescription className="text-emerald-200/80 text-sm">
              Review tenant details and activate or deactivate access.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-88px)] bg-gray-50/70">
            {selectedBusinessId && (
              <SuperAdminBusinessDetails
                businessId={selectedBusinessId}
                onClose={() => setSelectedBusinessId(null)}
                onUpdated={fetchTenants}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
