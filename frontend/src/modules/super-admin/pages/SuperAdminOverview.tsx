import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Building2, Users, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function SuperAdminOverview() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="text-gray-500">Loading dashboard...</div>;
  }

  const activeTenants = tenants.filter(t => t.status === 'active' || t.status === 'trial').length;
  const suspendedTenants = tenants.filter(t => t.status === 'suspended').length;
  const trialTenants = tenants.filter(t => t.status === 'trial').length;
  const recentTenants = [...tenants].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Platform Overview</h2>
        <p className="text-sm text-gray-500 mt-1">Key metrics and health of the Omnitrack platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-gray-700">Total Businesses</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{tenants.filter(t => t.business).length}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-gray-700">Active Businesses</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{activeTenants}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 border border-amber-100 rounded-xl flex items-center justify-center">
              <CalendarClock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-gray-700">Trial Businesses</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{trialTenants}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-gray-700">Suspended</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{suspendedTenants}</p>
        </div>
      </div>

      {/* Recent Businesses Table Summary */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Recent Businesses</h3>
          <Button variant="outline" size="sm" asChild>
            <Link to="/super-admin/businesses">View All</Link>
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/80 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Business</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentTenants.map((t) => (
                <tr key={t.subscription_id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-medium text-gray-900">{t.business?.name || 'N/A'}</td>
                  <td className="px-6 py-4 capitalize">{t.plan}</td>
                  <td className="px-6 py-4 capitalize text-emerald-700">{t.status}</td>
                  <td className="px-6 py-4 text-right text-gray-500">
                    {t.created_at ? new Date(t.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
              {recentTenants.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No businesses found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
