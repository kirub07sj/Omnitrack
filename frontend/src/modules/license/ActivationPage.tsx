import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KeyRound, Loader2, AlertCircle, ShieldCheck, CheckCircle2, MonitorSmartphone } from 'lucide-react';
import axios from 'axios';

type StepStatus = 'pending' | 'loading' | 'done' | 'error';
interface Step {
  id: string;
  label: string;
  status: StepStatus;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export default function ActivationPage() {
  const [key, setKey] = useState('');
  const [view, setView] = useState<'input' | 'activating' | 'success'>('input');
  const [error, setError] = useState('');
  const { checkSetupStatus, licenseError } = useAppStore();
  
  const [steps, setSteps] = useState<Step[]>([
    { id: 'connect', label: 'Connecting to license server', status: 'pending' },
    { id: 'verify', label: 'Verifying product key', status: 'pending' },
    { id: 'check', label: 'Checking license status', status: 'pending' },
    { id: 'create', label: 'Creating device activation', status: 'pending' },
  ]);
  
  const [receipt, setReceipt] = useState<any>(null);

  const resetSteps = () => {
    setSteps(s => s.map(step => ({ ...step, status: 'pending' })));
  };

  const updateStep = (id: string, status: StepStatus) => {
    setSteps(s => s.map(step => step.id === id ? { ...step, status } : step));
  };

  const handleActivate = async () => {
    if (!key.trim()) {
      setError('Please enter an activation key.');
      return;
    }
    
    setError('');
    resetSteps();
    setView('activating');
    
    try {
      // Start API request in parallel
      const apiReq = axios.post('/api/license/activate', { licenseKey: key.trim() });
      
      // Step 1
      updateStep('connect', 'loading');
      await delay(800);
      updateStep('connect', 'done');
      
      // Step 2
      updateStep('verify', 'loading');
      await delay(600);
      updateStep('verify', 'done');

      // Step 3
      updateStep('check', 'loading');
      
      // Wait for actual API response here
      const response = await apiReq;
      
      updateStep('check', 'done');
      
      // Step 4
      updateStep('create', 'loading');
      await delay(700);
      updateStep('create', 'done');

      await delay(400);
      setReceipt({ ...response.data.data, licenseKey: key.trim() });
      setView('success');
      
    } catch (err: any) {
      // Mark current loading step as error
      setSteps(s => s.map(step => step.status === 'loading' ? { ...step, status: 'error' } : step));
      await delay(1200); // let them see the error state briefly
      
      setError(err.response?.data?.message || 'Failed to activate license.');
      setView('input');
    }
  };

  const maskKey = (k: string) => {
    if (!k || k.length < 4) return k;
    const last4 = k.slice(-4);
    return `••••-••••-••••-${last4}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDevBypass = () => {
    useAppStore.setState({ isLicensed: true });
  };

  const finishActivation = async () => {
    await checkSetupStatus();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden p-4 bg-[#0A0A0A] font-sans">
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes float-slow-reverse {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(-30px, 50px) scale(1.1); }
          66% { transform: translate(20px, -20px) scale(0.9); }
        }
        .animate-orb-1 {
          animation: float-slow 15s ease-in-out infinite;
        }
        .animate-orb-2 {
          animation: float-slow-reverse 18s ease-in-out infinite;
        }
      `}</style>
      
      {/* Deep Emerald Background with Glows */}
      <div className="absolute inset-0 z-0 bg-[#063322]" />
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0B4A34] via-[#052619] to-[#02130C] opacity-90" />
      <div className="absolute -top-[20%] -left-[20%] w-[80%] h-[80%] bg-[#0FA369] blur-[150px] rounded-full opacity-25 pointer-events-none animate-orb-1" />
      <div className="absolute bottom-[10%] right-[10%] w-[60%] h-[60%] bg-[#086343] blur-[120px] rounded-full opacity-35 pointer-events-none animate-orb-2" />

      {/* Brand Logo Top Left */}
      <div className="absolute top-8 left-8 z-20 flex items-center gap-3">
        <div className="w-10 h-10 flex items-center justify-center">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-white">Omnitrack</span>
      </div>
      
      <div className="w-full max-w-[440px] relative z-10 omni-animate-in">
        <div className=" rounded-3xl p-10 flex flex-col items-center text-center overflow-hidden relative">
          
          {/* INPUT VIEW */}
          {view === 'input' && (
            <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 flex items-center justify-center mb-5">
                <img src="/logo.png" alt="Omnitrack Logo" className="w-full h-full object-contain drop-shadow-md" />
              </div>
              
              <h1 className="text-2xl font-bold mb-2 tracking-tight text-white">Activate Software</h1>
              <p className="text-emerald-100/70 mb-8 text-sm">
                Please enter your Activation Key to continue using the system.
              </p>

              {licenseError && !error && (
                <div className="w-full bg-amber-500/10 border border-amber-500/30 text-amber-200 p-3 rounded-xl flex items-start gap-3 mb-6 text-sm text-left">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
                  <span>{licenseError}</span>
                </div>
              )}

              {error && (
                <div className="w-full bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-xl flex items-start gap-3 mb-6 text-sm text-left animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              <div className="w-full space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[13px] font-medium text-emerald-100/80 pl-1">Activation Key</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-100/40">
                      <KeyRound className="h-5 w-5" />
                    </div>
                    <Input 
                      type="text" 
                      placeholder="XXXX-XXXX-XXXX-XXXX" 
                      value={key}
                      onChange={(e) => setKey(e.target.value)}
                      className="pl-12 h-14 bg-white/5 border border-white/15 rounded-xl text-md font-mono text-white placeholder-emerald-100/30 focus-visible:ring-emerald-400 focus-visible:border-emerald-400 transition-all shadow-none"
                      onKeyDown={(e) => e.key === 'Enter' && handleActivate()}
                    />
                  </div>
                </div>

                <Button 
                  className="w-full h-14 text-[15px] font-semibold mt-4 shadow-lg shadow-emerald-950/60 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all" 
                  onClick={handleActivate}
                  disabled={view !== 'input'}
                >
                  Activate License
                </Button>

                <button 
                  onClick={handleDevBypass}
                  className="mt-6 text-xs text-emerald-100/40 hover:text-emerald-100/80 transition-colors"
                >
                  Bypass for development (Test Mode)
                </button>
              </div>
            </div>
          )}

          {/* ACTIVATING VIEW */}
          {view === 'activating' && (
            <div className="w-full flex flex-col items-center animate-in slide-in-from-right-8 fade-in duration-500 py-4">
              <div className="w-16 h-16 flex items-center justify-center mb-5 relative">
                <img src="/logo.png" alt="Omnitrack Logo" className="w-full h-full object-contain drop-shadow-md animate-pulse" />
              </div>
              
              <h1 className="text-2xl font-bold mb-8 tracking-tight text-white">Activating your license</h1>
              
              <div className="w-full space-y-5 text-left pl-4">
                {steps.map((step) => (
                  <div key={step.id} className="flex items-center gap-4">
                    <div className="w-6 h-6 flex items-center justify-center shrink-0">
                      {step.status === 'pending' && <div className="w-2.5 h-2.5 rounded-full bg-white/20" />}
                      {step.status === 'loading' && <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />}
                      {step.status === 'done' && <CheckCircle2 className="w-6 h-6 text-emerald-400 animate-in zoom-in" />}
                      {step.status === 'error' && <AlertCircle className="w-6 h-6 text-red-400 animate-in zoom-in" />}
                    </div>
                    <span className={`text-[15px] transition-colors duration-300 ${
                      step.status === 'pending' ? 'text-emerald-100/40' :
                      step.status === 'loading' ? 'text-white font-medium' :
                      step.status === 'error' ? 'text-red-400 font-medium' :
                      'text-white'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUCCESS VIEW */}
          {view === 'success' && receipt && (
            <div className="w-full flex flex-col items-center animate-in zoom-in-95 fade-in duration-500 py-2">
              <div className="w-16 h-16 flex items-center justify-center mb-5 text-emerald-400">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              
              <h1 className="text-2xl font-bold mb-2 tracking-tight text-white">License activated</h1>
              <p className="text-emerald-100/70 mb-8 text-sm">Your software is ready to use.</p>
              
              <div className="w-full bg-white/5 rounded-2xl p-6 space-y-4 text-[13.5px] mb-8 text-left border border-white/10">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <span className="text-emerald-100/60">Plan</span>
                  <span className="font-semibold text-white capitalize">{receipt.plan || 'Professional'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <span className="text-emerald-100/60">License</span>
                  <span className="font-mono text-white">{maskKey(receipt.licenseKey)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <span className="text-emerald-100/60">Activated</span>
                  <span className="font-medium text-white">{formatDate(receipt.activatedAt || receipt.validUntil)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <span className="text-emerald-100/60">Expires</span>
                  <span className="font-medium text-white">{formatDate(receipt.expiresAt || receipt.validUntil)}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-emerald-100/60">Device</span>
                  <span className="font-medium text-white flex items-center gap-2">
                    <MonitorSmartphone className="w-4 h-4 text-emerald-300/60" />
                    This terminal
                  </span>
                </div>
              </div>

              <Button 
                className="w-full h-14 text-[15px] font-semibold shadow-lg shadow-emerald-950/60 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all" 
                onClick={finishActivation}
              >
                Continue to OmniTrack
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
