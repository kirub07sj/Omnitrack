import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Package, Wallet, ShoppingCart, KeyRound, AlertTriangle } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type AppNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  href: string;
  createdAt: string;
};

const TYPE_ICON: Record<string, typeof Bell> = {
  inventory: Package,
  expense: Wallet,
  purchase: Package,
  order: ShoppingCart,
  license: KeyRound,
};

export default function NotificationsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    apiFetch('/api/dashboard/notifications')
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
      })
      .catch(() => {
        if (!cancelled) setNotifications([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const handleOpen = (item: AppNotification) => {
    onOpenChange(false);
    navigate(item.href);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden border-emerald-100 gap-0">
        <DialogHeader className="bg-gradient-to-r from-emerald-900 via-emerald-950 to-emerald-900 px-6 py-5 text-left space-y-1">
          <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5" /> Notifications
          </DialogTitle>
          <DialogDescription className="text-emerald-200/80 text-sm">
            Things that need your attention across the business.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto bg-white p-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl border border-emerald-50">
                  <Skeleton className="h-10 w-10 rounded-full bg-emerald-100 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3 bg-emerald-100" />
                    <Skeleton className="h-3 w-full bg-emerald-50" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <Bell className="w-5 h-5 text-emerald-700" />
              </div>
              <p className="font-semibold text-emerald-950">You're all caught up</p>
              <p className="text-sm text-muted-foreground mt-1">There are no alerts for this business right now.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((item) => {
                const Icon = TYPE_ICON[item.type] || AlertTriangle;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleOpen(item)}
                    className="w-full text-left flex gap-3 p-3 rounded-xl border border-emerald-100 hover:bg-emerald-50/70 hover:border-emerald-200 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-emerald-800" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-emerald-950">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.message}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
