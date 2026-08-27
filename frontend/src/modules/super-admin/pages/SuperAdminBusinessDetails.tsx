import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2, CalendarClock, Users, Key, RefreshCcw, Activity, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function SuperAdminBusinessDetails() {
  const { id } = useParams();
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      fetchBusinessDetails(id);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="text-center py-20 text-gray-500">
        Business not found.
        <br />
        <Link to="/super-admin/businesses" className="text-emerald-600 hover:underline mt-4 inline-block">Return to Businesses</Link>
      </div>
    );
  }

  const subscription = business.subscriptions?.[0];
  const isSubscriptionActive = subscription?.status === 'active' || subscription?.status === 'trial';

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Header */}
      <div className="flex items-start justify-between bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-start gap-4">
          <Link to="/super-admin/businesses" className="mt-1 flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">{business.name}</h2>
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${
                isSubscriptionActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
              }`}>
                {isSubscriptionActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Created on {new Date(business.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-gray-200 bg-white px-2 pt-2 rounded-t-xl">
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
                  ? 'border-emerald-600 text-emerald-700' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-b-xl rounded-tr-xl border border-gray-200 shadow-sm p-6 min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-4">Contact Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-xs font-medium text-gray-500">Email Address</dt>
                    <dd className="text-sm text-gray-900">{business.email || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500">Phone Number</dt>
                    <dd className="text-sm text-gray-900">{business.phone || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500">Address</dt>
                    <dd className="text-sm text-gray-900">{business.address || 'Not provided'}</dd>
                  </div>
                </dl>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-4">Quick Stats</h3>
                <dl className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <dt className="text-xs font-medium text-gray-500">Total Users</dt>
                    <dd className="text-2xl font-bold text-gray-900 mt-1">{business.users?.length || 0}</dd>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <dt className="text-xs font-medium text-gray-500">Plan</dt>
                    <dd className="text-2xl font-bold text-gray-900 mt-1 capitalize">{subscription?.plan || 'None'}</dd>
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
                <thead className="bg-gray-50 text-gray-600 font-medium border-y border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Username</th>
                    <th className="px-4 py-3">Employee Name</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {business.users?.map((u: any) => (
                    <tr key={u.id}>
                      <td className="px-4 py-3 font-medium">{u.username}</td>
                      <td className="px-4 py-3">{u.employee?.first_name} {u.employee?.last_name}</td>
                      <td className="px-4 py-3">{u.role?.name || 'Unknown'}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md">Active</span>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Details</h3>
            {subscription ? (
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <dt className="text-xs font-medium text-gray-500">Current Plan</dt>
                    <dd className="text-lg font-bold text-gray-900 mt-1 capitalize">{subscription.plan}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500">Status</dt>
                    <dd className="mt-1">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${
                        isSubscriptionActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>
                        {subscription.status}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500">Started At</dt>
                    <dd className="text-sm text-gray-900 mt-1">{new Date(subscription.starts_at).toLocaleDateString()}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500">Expires At</dt>
                    <dd className="text-sm text-gray-900 mt-1">{subscription.expires_at ? new Date(subscription.expires_at).toLocaleDateString() : 'Never'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500">Account Owner</dt>
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
            
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
              <Key className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <h4 className="text-gray-900 font-medium">No Devices Registered</h4>
              <p className="text-sm text-gray-500 mt-1">This business has not activated any desktop or mobile devices yet.</p>
            </div>
          </div>
        )}

        {(activeTab === 'sync' || activeTab === 'activity') && (
          <div className="text-center py-12">
            <RefreshCcw className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Module Under Construction</h3>
            <p className="text-sm text-gray-500 mt-1">Detailed {activeTab} logs will be available in the next platform update.</p>
          </div>
        )}

      </div>
    </div>
  );
}
