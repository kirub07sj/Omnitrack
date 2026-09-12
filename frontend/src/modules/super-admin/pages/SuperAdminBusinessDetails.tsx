import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2, CalendarClock, Users, Key, RefreshCcw, Activity, ShieldCheck, ShieldOff, Mail, Phone, MapPin } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Props {
  businessId?: string;
  onClose?: () => void;
  onUpdated?: () => void;
}

function planLabel(plan?: string) {
  if (plan === 'trial' || plan === 'free') return 'Free Trial';
  if (plan === 'monthly' || plan === 'pro') return 'Paid Monthly';
  return plan || 'None';
}

function isLicenseActive(subscription: any) {
  if (!subscription) return false;
  const live = subscription.status === 'active' || subscription.status === 'trial';
  const notExpired = !subscription.expires_at || new Date(subscription.expires_at) > new Date();
  return live && notExpired;
}

function BusinessDetailsSkeleton({ embedded }: { embedded?: boolean }) {
  return (
    <div className={`space-y-6 animate-in fade-in-50 duration-300 ${embedded ? 'p-6' : ''}`}>
      {!embedded && (
        <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <Skeleton className="h-10 w-10 rounded-full bg-emerald-100" />
              <div className="space-y-2">
                <Skeleton className="h-7 w-48 bg-emerald-100" />
                <Skeleton className="h-4 w-36 bg-emerald-50" />
              </div>
            </div>
            <Skeleton className="h-9 w-36 rounded-md bg-emerald-100" />
          </div>
        </div>
      )}

      {embedded && (
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-52 bg-emerald-100" />
            <Skeleton className="h-4 w-40 bg-emerald-50" />
          </div>
          <Skeleton className="h-9 w-36 rounded-md bg-emerald-100" />
        </div>
      )}

      <div className="flex gap-2 border-b border-emerald-100 pb-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-md bg-emerald-50" />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Skeleton className="h-5 w-40 bg-emerald-100" />
          <Skeleton className="h-4 w-full bg-emerald-50" />
          <Skeleton className="h-4 w-3/4 bg-emerald-50" />
          <Skeleton className="h-4 w-2/3 bg-emerald-50" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24 rounded-xl bg-emerald-50" />
          <Skeleton className="h-24 rounded-xl bg-emerald-50" />
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminBusinessDetails({ businessId: propId, onUpdated }: Props = {}) {
  const { id: paramId } = useParams();
  const id = propId || paramId;
  const embedded = Boolean(propId);
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [toggling, setToggling] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'activate' | 'deactivate' | null>(null);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchBusinessDetails(id);
  }, [id]);

  const fetchBusinessDetails = async (businessId: string) => {
    try {
      const res = await apiFetch(`/api/super-admin/businesses/${businessId}`);
      const data = await res.json();
      if (data.success) {
        setBusiness(data.business);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLicenseToggle = async () => {
    const currentSubscription = business?.subscription || business?.subscriptions?.[0];
    if (!currentSubscription?.id || !confirmAction) return;
    setToggling(true);
    setActionError('');
    try {
      const res = await apiFetch(`/api/super-admin/tenants/${currentSubscription.id}/subscription`, {
        method: 'PUT',
        body: JSON.stringify({ action: confirmAction })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setActionError(data.message || 'Failed to update license.');
        return;
      }
      setConfirmAction(null);
      await fetchBusinessDetails(id as string);
      onUpdated?.();
    } catch (err) {
      console.error(err);
      setActionError('Could not reach the server. Please try again.');
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return <BusinessDetailsSkeleton embedded={embedded} />;
  }

  if (!business) {
    return (
      <div className={`text-center py-20 text-gray-500 ${embedded ? 'p-8' : ''}`}>
        Business not found.
        <br />
        {!embedded && (
          <Link to="/super-admin/businesses" className="text-emerald-700 hover:underline mt-4 inline-block">
            Return to Businesses
          </Link>
        )}
      </div>
    );
  }

  const subscription = business.subscription || business.subscriptions?.[0];
  const licenseActive = isLicenseActive(subscription);

  return (
    <div className={`space-y-6 animate-in fade-in-50 duration-500 ${embedded ? 'p-6 pt-2' : ''}`}>
      <div className={embedded ? '' : 'flex items-start justify-between bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm'}>
        <div className={`flex items-start justify-between gap-4 ${embedded ? '' : 'w-full'}`}>
          <div className="flex items-start gap-4">
            {!embedded && (
              <Link to="/super-admin/businesses" className="mt-1 flex items-center justify-center w-8 h-8 rounded-full hover:bg-emerald-50 text-gray-500 hover:text-emerald-800 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            )}
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className={`font-bold text-gray-900 ${embedded ? 'text-xl' : 'text-2xl'}`}>{business.name}</h2>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${
                  licenseActive
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-100'
                }`}>
                  {licenseActive ? 'License Active' : 'License Inactive'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-700" /> Created on {new Date(business.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {subscription && (
            <Button
              onClick={() => {
                setActionError('');
                setConfirmAction(licenseActive ? 'deactivate' : 'activate');
              }}
              className={licenseActive
                ? 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50 shadow-sm'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm'
              }
              variant={licenseActive ? 'outline' : 'default'}
            >
              {licenseActive ? (
                <><ShieldOff className="w-4 h-4" /> Deactivate License</>
              ) : (
                <><ShieldCheck className="w-4 h-4" /> Activate License</>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="flex space-x-1 border-b border-emerald-100 bg-white px-2 pt-2 rounded-t-xl">
        {[
          { id: 'overview', name: 'Overview', icon: Building2 },
          { id: 'users', name: 'Users', icon: Users },
          { id: 'subscription', name: 'Subscription', icon: CalendarClock },
          { id: 'license', name: 'License & Devices', icon: Key },
          { id: 'sync', name: 'Synchronization', icon: RefreshCcw },
          { id: 'activity', name: 'Activity', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-gray-500 hover:text-emerald-800 hover:border-emerald-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-gray-400'}`} />
              {tab.name}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-b-xl rounded-tr-xl border border-emerald-100 shadow-sm p-6 min-h-[360px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 border-b border-emerald-50 pb-2 mb-4">Contact Information</h3>
                <dl className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-emerald-700 mt-0.5" />
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Email Address</dt>
                      <dd className="text-sm text-gray-900">{business.email || 'Not provided'}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-emerald-700 mt-0.5" />
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Phone Number</dt>
                      <dd className="text-sm text-gray-900">{business.phone || 'Not provided'}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-emerald-700 mt-0.5" />
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Address</dt>
                      <dd className="text-sm text-gray-900">{business.address || 'Not provided'}</dd>
                    </div>
                  </div>
                </dl>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 border-b border-emerald-50 pb-2 mb-4">Quick Stats</h3>
                <dl className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
                    <dt className="text-xs font-medium text-emerald-800/70">Total Users</dt>
                    <dd className="text-2xl font-bold text-emerald-950 mt-1">{business.users?.length || 0}</dd>
                  </div>
                  <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
                    <dt className="text-xs font-medium text-emerald-800/70">Plan</dt>
                    <dd className="text-2xl font-bold text-emerald-950 mt-1">{planLabel(subscription?.plan)}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Users</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-emerald-50/80 text-emerald-900 font-medium border-y border-emerald-100">
                  <tr>
                    <th className="px-4 py-3">Username</th>
                    <th className="px-4 py-3">Employee Name</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50">
                  {business.users?.map((u: any) => (
                    <tr key={u.id}>
                      <td className="px-4 py-3 font-medium">{u.username}</td>
                      <td className="px-4 py-3">{u.employee?.first_name} {u.employee?.last_name}</td>
                      <td className="px-4 py-3">{u.role?.name || 'Unknown'}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-100">Active</span>
                      </td>
                    </tr>
                  ))}
                  {(!business.users || business.users.length === 0) && (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No users found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'subscription' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Subscription Details</h3>
              {subscription && (
                <Button
                  size="sm"
                  onClick={() => {
                    setActionError('');
                    setConfirmAction(licenseActive ? 'deactivate' : 'activate');
                  }}
                  className={licenseActive
                    ? 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                  }
                  variant={licenseActive ? 'outline' : 'default'}
                >
                  {licenseActive ? 'Deactivate License' : 'Activate License'}
                </Button>
              )}
            </div>
            {subscription ? (
              <div className="bg-emerald-50/40 p-6 rounded-xl border border-emerald-100">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <dt className="text-xs font-medium text-emerald-800/70">Current Plan</dt>
                    <dd className="text-lg font-bold text-emerald-950 mt-1">{planLabel(subscription.plan)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-emerald-800/70">Status</dt>
                    <dd className="mt-1">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border capitalize ${
                        licenseActive
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>
                        {subscription.status}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-emerald-800/70">Started At</dt>
                    <dd className="text-sm text-gray-900 mt-1">{new Date(subscription.starts_at).toLocaleDateString()}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-emerald-800/70">Expires At</dt>
                    <dd className="text-sm text-gray-900 mt-1">{subscription.expires_at ? new Date(subscription.expires_at).toLocaleDateString() : 'Never'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-emerald-800/70">Account Owner</dt>
                    <dd className="text-sm text-gray-900 mt-1">
                      {subscription.account?.first_name} {subscription.account?.last_name}<br/>
                      <span className="text-gray-500">{subscription.account?.email}</span>
                    </dd>
                  </div>
                </dl>
              </div>
            ) : (
              <p className="text-gray-500">No subscription record found.</p>
            )}
          </div>
        )}

        {activeTab === 'license' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Devices</h3>
            <p className="text-sm text-gray-500 mb-6">Omnitrack offline installations and point-of-sale devices.</p>

            <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-8 text-center">
              <Key className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
              <h4 className="text-gray-900 font-medium">No Devices Registered</h4>
              <p className="text-sm text-gray-500 mt-1">This business has not activated any desktop or mobile devices yet.</p>
            </div>
          </div>
        )}

        {(activeTab === 'sync' || activeTab === 'activity') && (
          <div className="text-center py-12">
            <RefreshCcw className="w-12 h-12 text-emerald-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Module Under Construction</h3>
            <p className="text-sm text-gray-500 mt-1">Detailed {activeTab} logs will be available in the next platform update.</p>
          </div>
        )}
      </div>

      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && !toggling && setConfirmAction(null)}>
        <AlertDialogContent className="border-emerald-100 sm:max-w-[440px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-emerald-950">
              {confirmAction === 'deactivate' ? 'Deactivate this license?' : 'Activate this license?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === 'deactivate'
                ? `Staff at ${business.name} will lose POS and dashboard access immediately. Existing data is kept.`
                : `Access for ${business.name} will be restored. If the license is expired, it will be extended by 30 days.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {actionError && (
            <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">{actionError}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={toggling} className="border-emerald-200 text-emerald-900 hover:bg-emerald-50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={toggling}
              onClick={(e) => {
                e.preventDefault();
                handleLicenseToggle();
              }}
              className={confirmAction === 'deactivate'
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
              }
            >
              {toggling
                ? 'Updating...'
                : confirmAction === 'deactivate'
                  ? 'Deactivate License'
                  : 'Activate License'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
