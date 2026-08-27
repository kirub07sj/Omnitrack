import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Loader2, Building2, CalendarClock, User } from 'lucide-react';

export default function SuperAdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const res = await apiFetch('/api/super-admin/subscriptions');
      const data = await res.json();
      if (data.success) setSubscriptions(data.subscriptions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Platform Subscriptions</h2>
        <p className="text-sm text-gray-500 mt-1">Manage billing, plans, and subscription states for all businesses.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/80 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Business</th>
                <th className="px-6 py-4">Account Owner</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Starts</th>
                <th className="px-6 py-4 text-right">Expires</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscriptions.map(s => (
                <tr key={s.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-emerald-600" /> {s.business?.name || 'N/A'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <User className="w-4 h-4 text-gray-400" /> {s.account?.first_name} {s.account?.last_name}
                    </div>
                    {s.account?.email && <p className="text-xs text-gray-500 ml-5.5 mt-0.5">{s.account.email}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize font-medium">{s.plan}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-md border ${
                      s.status === 'active' || s.status === 'trial'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(s.starts_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">
                    {s.expires_at ? new Date(s.expires_at).toLocaleDateString() : 'Never'}
                  </td>
                </tr>
              ))}
              {subscriptions.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No subscriptions found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
