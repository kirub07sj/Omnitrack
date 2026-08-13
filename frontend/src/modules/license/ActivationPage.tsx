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
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden p-4">
      {/* Ambient background */}
      <div className="absolute inset-0 omni-bg-dots opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10 omni-animate-in">
        <div className="bg-card border border-border shadow-2xl rounded-2xl p-8 flex flex-col items-center text-center overflow-hidden relative">
          
          {/* INPUT VIEW */}
          {view === 'input' && (
            <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              
              <h1 className="text-2xl font-bold mb-2 tracking-tight">Activate OmniTrack</h1>
              <p className="text-muted-foreground mb-6 text-sm">
                Please enter your Activation Key to continue using the software.
              </p>

              {licenseError && !error && (
                <div className="w-full bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg flex items-start gap-3 mb-6 text-sm text-left">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{licenseError}</span>
                </div>
              )}

              {error && (
                <div className="w-full bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-lg flex items-start gap-3 mb-6 text-sm text-left animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="w-full space-y-4">
                <div className="space-y-2 text-left">
                  <label className="text-sm font-semibold uppercase text-muted-foreground">Activation Key</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                      <KeyRound className="h-5 w-5" />
                    </div>
                    <Input 
                      type="text" 
                      placeholder="Enter your activation key..." 
                      value={key}
                      onChange={(e) => setKey(e.target.value)}
                      className="pl-10 h-12 text-md font-mono"
                      onKeyDown={(e) => e.key === 'Enter' && handleActivate()}
                    />
                  </div>
                </div>

                <Button 
                  className="w-full h-12 text-md font-semibold mt-4 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 active:scale-95" 
                  onClick={handleActivate}
                >
                  Activate Software
                </Button>

                <button 
                  onClick={handleDevBypass}
                  className="mt-6 text-xs text-muted-foreground underline hover:text-foreground transition-colors"
                >
                  Bypass for development (Test Mode)
                </button>
              </div>
            </div>
          )}

          {/* ACTIVATING VIEW */}
          {view === 'activating' && (
            <div className="w-full flex flex-col items-center animate-in slide-in-from-right-8 fade-in duration-500">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 relative">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              
              <h1 className="text-xl font-bold mb-8 tracking-tight">Activating your license...</h1>
              
              <div className="w-full space-y-4 text-left">
                {steps.map((step) => (
                  <div key={step.id} className="flex items-center gap-3">
                    <div className="w-6 h-6 flex items-center justify-center shrink-0">
                      {step.status === 'pending' && <div className="w-2 h-2 rounded-full bg-border" />}
                      {step.status === 'loading' && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                      {step.status === 'done' && <CheckCircle2 className="w-5 h-5 text-emerald-500 animate-in zoom-in" />}
                      {step.status === 'error' && <AlertCircle className="w-5 h-5 text-destructive animate-in zoom-in" />}
                    </div>
                    <span className={`text-sm transition-colors duration-300 ${
                      step.status === 'pending' ? 'text-muted-foreground' :
                      step.status === 'loading' ? 'text-foreground font-medium' :
                      step.status === 'error' ? 'text-destructive font-medium' :
                      'text-foreground'
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
            <div className="w-full flex flex-col items-center animate-in zoom-in-95 fade-in duration-500">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 text-emerald-500">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              
              <h1 className="text-2xl font-bold mb-1 tracking-tight text-emerald-600">License activated</h1>
              <p className="text-muted-foreground mb-8 text-sm">Your software is ready to use.</p>
              
              <div className="w-full bg-muted/50 rounded-xl p-5 space-y-4 text-sm mb-8 text-left border border-border">
                <div className="flex justify-between items-center border-b border-border/50 pb-3">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-semibold text-foreground capitalize">{receipt.plan || 'Professional'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-border/50 pb-3">
                  <span className="text-muted-foreground">License</span>
                  <span className="font-mono text-foreground">{maskKey(receipt.licenseKey)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-border/50 pb-3">
                  <span className="text-muted-foreground">Activated</span>
                  <span className="font-medium text-foreground">{formatDate(receipt.activatedAt || receipt.validUntil)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-border/50 pb-3">
                  <span className="text-muted-foreground">Expires</span>
                  <span className="font-medium text-foreground">{formatDate(receipt.expiresAt || receipt.validUntil)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Device</span>
                  <span className="font-medium text-foreground flex items-center gap-2">
                    <MonitorSmartphone className="w-4 h-4 opacity-50" />
                    This computer
                  </span>
                </div>
              </div>

              <Button 
                className="w-full h-12 text-md font-semibold shadow-lg shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-600 text-white transition-all hover:-translate-y-0.5 active:scale-95" 
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
