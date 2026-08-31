import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, AlertCircle, Building2, Mail, Phone, MapPin, User, Lock, ChevronRight } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import logo from '@/assets/logo.png';


const businessSchema = z.object({
  name: z.string().min(1, "Business name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional()
});

const ownerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export default function SetupWizard() {
  const { currentSetupStep, checkSetupStatus, markBusinessCreated, markOwnerCreated } = useAppStore();
  
  const [businessData, setBusinessData] = useState({ name: '', email: '', phone: '', address: '' });
  const [ownerData, setOwnerData] = useState({ firstName: '', lastName: '', username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkSetupStatus();
  }, [checkSetupStatus]);

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const validation = businessSchema.safeParse(businessData);
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      setLoading(false);
      return;
    }

    try {
      const res = await apiFetch('/api/business/setup', {
        method: 'POST',
        body: JSON.stringify(businessData)
      });
      const data = await res.json();
      
      if (data.success) {
        markBusinessCreated();
      } else {
        setError(data.message);
        if (data.message.includes('already been set up') || data.message.includes('already exists')) {
          setTimeout(() => markBusinessCreated(), 1500);
        }
      }
    } catch (err) {
      setError('Connection failed to backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const validation = ownerSchema.safeParse(ownerData);
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      setLoading(false);
      return;
    }

    try {
      const res = await apiFetch('/api/auth/setup-owner', {
        method: 'POST',
        body: JSON.stringify(ownerData)
      });
      const data = await res.json();
      
      if (data.success) {
        markOwnerCreated();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Connection failed to backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {currentSetupStep === 1 && (
        <div className="w-full flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300 py-8">
          <div className="w-16 h-16 flex items-center justify-center mb-6 relative">
             <img src={logo} alt="Omnitrack Logo" className="w-full h-full object-contain drop-shadow-md animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold mb-2 tracking-tight text-white">Connecting to Services</h2>
          <p className="text-emerald-100/70 mb-8 text-sm max-w-[280px]">
            Please wait while we initialize the local backend connection...
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            className="h-12 px-6 border-white/20 text-white hover:bg-white/10 hover:text-white rounded-xl transition-all"
          >
            Retry Connection
          </Button>
        </div>
      )}

      {currentSetupStep === 2 && (
        <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-12 h-12 flex items-center justify-center mb-4">
             <Building2 className="w-8 h-8 text-emerald-400 drop-shadow-md" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2 tracking-tight text-white">Business Profile</h2>
          <p className="text-emerald-100/70 mb-8 text-[13.5px] text-center">
            Set up your business details. You can change this later in settings.
          </p>

          <form onSubmit={handleCreateBusiness} className="w-full space-y-4">
            {error && (
              <div className="w-full bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-xl flex items-start gap-3 mb-2 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5 text-left">
              <label className="text-[13px] font-medium text-emerald-100/80 pl-1">Business Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-100/40">
                  <Building2 className="h-4 w-4" />
                </div>
                <Input 
                  value={businessData.name}
                  onChange={(e) => setBusinessData({ ...businessData, name: e.target.value })}
                  placeholder="Grand Hotel & Restaurant" 
                  required
                  className="pl-11 h-12 bg-white/5 border border-white/15 rounded-xl text-[14.5px] text-white placeholder-emerald-100/30 focus-visible:ring-emerald-400 focus-visible:border-emerald-400 shadow-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 text-left">
                <label className="text-[13px] font-medium text-emerald-100/80 pl-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-100/40">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input 
                    type="email"
                    value={businessData.email}
                    onChange={(e) => setBusinessData({ ...businessData, email: e.target.value })}
                    placeholder="contact@hotel.com" 
                    className="pl-10 h-12 bg-white/5 border border-white/15 rounded-xl text-[14.5px] text-white placeholder-emerald-100/30 focus-visible:ring-emerald-400 focus-visible:border-emerald-400 shadow-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[13px] font-medium text-emerald-100/80 pl-1">Phone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-100/40">
                    <Phone className="h-4 w-4" />
                  </div>
                  <Input 
                    value={businessData.phone}
                    onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value })}
                    placeholder="+1 234 567 8900" 
                    className="pl-10 h-12 bg-white/5 border border-white/15 rounded-xl text-[14.5px] text-white placeholder-emerald-100/30 focus-visible:ring-emerald-400 focus-visible:border-emerald-400 shadow-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-[13px] font-medium text-emerald-100/80 pl-1">Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-100/40">
                  <MapPin className="h-4 w-4" />
                </div>
                <Input 
                  value={businessData.address}
                  onChange={(e) => setBusinessData({ ...businessData, address: e.target.value })}
                  placeholder="123 Main St, City" 
                  className="pl-11 h-12 bg-white/5 border border-white/15 rounded-xl text-[14.5px] text-white placeholder-emerald-100/30 focus-visible:ring-emerald-400 focus-visible:border-emerald-400 shadow-none transition-all"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-[15px] font-semibold mt-8 shadow-lg shadow-emerald-950/60 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all flex items-center justify-center gap-2" 
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</>
              ) : (
                <>Continue <ChevronRight className="w-5 h-5" /></>
              )}
            </Button>
          </form>
        </div>
      )}

      {currentSetupStep === 3 && (
        <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-right-8 duration-500">
          <div className="w-12 h-12 flex items-center justify-center mb-4">
             <User className="w-8 h-8 text-emerald-400 drop-shadow-md" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2 tracking-tight text-white">Owner Account</h2>
          <p className="text-emerald-100/70 mb-8 text-[13.5px] text-center">
            Create the primary administrator account for the system.
          </p>

          <form onSubmit={handleCreateOwner} className="w-full space-y-4">
            {error && (
              <div className="w-full bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-xl flex items-start gap-3 mb-2 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 text-left">
                <label className="text-[13px] font-medium text-emerald-100/80 pl-1">First Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-100/40">
                    <User className="h-4 w-4" />
                  </div>
                  <Input 
                    value={ownerData.firstName}
                    onChange={(e) => setOwnerData({ ...ownerData, firstName: e.target.value })}
                    placeholder="John" 
                    required
                    className="pl-10 h-12 bg-white/5 border border-white/15 rounded-xl text-[14.5px] text-white placeholder-emerald-100/30 focus-visible:ring-emerald-400 focus-visible:border-emerald-400 shadow-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[13px] font-medium text-emerald-100/80 pl-1">Last Name</label>
                <div className="relative">
                  <Input 
                    value={ownerData.lastName}
                    onChange={(e) => setOwnerData({ ...ownerData, lastName: e.target.value })}
                    placeholder="Doe" 
                    required
                    className="px-4 h-12 bg-white/5 border border-white/15 rounded-xl text-[14.5px] text-white placeholder-emerald-100/30 focus-visible:ring-emerald-400 focus-visible:border-emerald-400 shadow-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-[13px] font-medium text-emerald-100/80 pl-1">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-100/40">
                  <User className="h-4 w-4" />
                </div>
                <Input 
                  value={ownerData.username}
                  onChange={(e) => setOwnerData({ ...ownerData, username: e.target.value })}
                  placeholder="admin" 
                  required
                  className="pl-11 h-12 bg-white/5 border border-white/15 rounded-xl text-[14.5px] text-white placeholder-emerald-100/30 focus-visible:ring-emerald-400 focus-visible:border-emerald-400 shadow-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-[13px] font-medium text-emerald-100/80 pl-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-100/40">
                  <Lock className="h-4 w-4" />
                </div>
                <Input 
                  type="password"
                  value={ownerData.password}
                  onChange={(e) => setOwnerData({ ...ownerData, password: e.target.value })}
                  placeholder="••••••••" 
                  required
                  className="pl-11 h-12 bg-white/5 border border-white/15 rounded-xl text-[14.5px] text-white placeholder-emerald-100/30 focus-visible:ring-emerald-400 focus-visible:border-emerald-400 shadow-none transition-all"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-[15px] font-semibold mt-8 shadow-lg shadow-emerald-950/60 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all flex items-center justify-center gap-2" 
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Creating Account...</>
              ) : (
                <>Finish Setup <ChevronRight className="w-5 h-5" /></>
              )}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}

