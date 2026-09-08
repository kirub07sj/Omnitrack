import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, User, Key, Check, Loader2, Sparkles, AlertCircle, Mail, AtSign, Settings2 } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

export default function AccountPermissionsPage() {
  const { currentUser, login } = useAppStore();
  
  const [firstName, setFirstName] = useState(currentUser?.firstName || '');
  const [lastName, setLastName] = useState(currentUser?.lastName || '');
  const [email, setEmail] = useState((currentUser as any)?.email || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [isUpdatingPin, setIsUpdatingPin] = useState(false);
  const [pinMsg, setPinMsg] = useState('');

  const permissions = [
    { module: 'Dashboard', owner: true, manager: true, cashier: false, waiter: false, kitchen: false },
    { module: 'Sales & Orders', owner: true, manager: true, cashier: true, waiter: true, kitchen: false },
    { module: 'Inventory', owner: true, manager: true, cashier: false, waiter: false, kitchen: false },
    { module: 'Employees', owner: true, manager: false, cashier: false, waiter: false, kitchen: false },
    { module: 'Settings', owner: true, manager: false, cashier: false, waiter: false, kitchen: false },
    { module: 'Reports', owner: true, manager: true, cashier: false, waiter: false, kitchen: false },
    { module: 'Kitchen Display', owner: true, manager: true, cashier: false, waiter: false, kitchen: true },
  ];

  const handleUpdateProfile = async () => {
    if (!firstName || !lastName || !username) {
      setProfileMsg('First name, last name, and username are required');
      return;
    }
    
    setIsUpdatingProfile(true);
    setProfileMsg('');
    
    try {
      const res = await axios.put('/api/auth/update-profile', {
        userId: currentUser?.id,
        firstName,
        lastName,
        email,
        username
      });
      
      if (res.data.success) {
        login(res.data.user); // Update the global store with the new user object
        
        // If the user is an owner, sync the business owner_name as well
        if (currentUser?.role?.toLowerCase() === 'owner' || currentUser?.role?.toLowerCase() === 'admin') {
          try {
            const { businessSettings, updateBusinessSettings } = useAppStore.getState();
            if (businessSettings) {
              const updatedSettings = { ...businessSettings, owner_name: `${firstName} ${lastName}` };
              await axios.put('/api/business/settings', updatedSettings);
              updateBusinessSettings(updatedSettings);
            }
          } catch (e) {
            console.error("Failed to sync business owner name", e);
          }
        }
        
        setProfileMsg('Profile updated successfully! ✨');
        setTimeout(() => setProfileMsg(''), 3000);
      }
    } catch (err: any) {
      setProfileMsg(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePin = async () => {
    if (!currentPin || !newPin) {
      setPinMsg('Both current and new PIN are required');
      return;
    }
    
    setIsUpdatingPin(true);
    setPinMsg('');
    
    try {
      const res = await axios.put('/api/auth/update-profile', {
        userId: currentUser?.id,
        currentPin,
        newPin
      });
      
      if (res.data.success) {
        setPinMsg('Security PIN secured! 🔒');
        setCurrentPin('');
        setNewPin('');
        setTimeout(() => setPinMsg(''), 3000);
      }
    } catch (err: any) {
      setPinMsg(err.response?.data?.message || 'Failed to update PIN');
    } finally {
      setIsUpdatingPin(false);
    }
  };

  return (
    <div className="min-h-full bg-slate-50/50 p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <User className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Account Center</h1>
        </div>
        <p className="text-muted-foreground ml-[52px]">Manage your personal identity, security settings, and system roles.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column: Profile & Security */}
        <div className="xl:col-span-5 space-y-8">
          
          {/* Profile Card */}
          <Card className="border-0 shadow-lg shadow-slate-200/40 rounded-2xl overflow-hidden bg-white/60 backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-primary"></div>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl"><Settings2 className="w-5 h-5 text-primary" /> Identity Settings</CardTitle>
              <CardDescription>How you appear to the rest of the team.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">First Name</Label>
                  <Input className="h-11 rounded-xl bg-slate-50" value={firstName} onChange={e => setFirstName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Last Name</Label>
                  <Input className="h-11 rounded-xl bg-slate-50" value={lastName} onChange={e => setLastName(e.target.value)} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Username</Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input className="pl-9 h-11 rounded-xl bg-slate-50 font-medium" value={username} onChange={e => setUsername(e.target.value)} placeholder="login_username" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address (Optional)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input className="pl-9 h-11 rounded-xl bg-slate-50" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
                </div>
              </div>

              <div className="bg-primary/5 rounded-xl p-4 flex items-center justify-between border border-primary/10">
                <div className="space-y-0.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Role</Label>
                  <p className="font-bold text-slate-900 capitalize text-lg">{currentUser?.role || 'Staff'}</p>
                </div>
                <Shield className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
            
            <CardFooter className="bg-slate-50/50 border-t px-6 py-4 flex-col items-stretch gap-3">
              {profileMsg && (
                <div className={`p-3 rounded-lg text-sm font-medium flex items-center gap-2 animate-in slide-in-from-bottom-2 ${profileMsg.includes('success') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {profileMsg.includes('success') ? <Sparkles className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {profileMsg}
                </div>
              )}
              <Button size="lg" className="w-full rounded-xl font-bold shadow-md hover:shadow-lg transition-all" onClick={handleUpdateProfile} disabled={isUpdatingProfile}>
                {isUpdatingProfile ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                {isUpdatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
              </Button>
            </CardFooter>
          </Card>

          {/* Security Card */}
          <Card className="border-0 shadow-lg shadow-slate-200/40 rounded-2xl overflow-hidden bg-white/60 backdrop-blur-xl relative">
             <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-slate-800 to-slate-600"></div>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl"><Key className="w-5 h-5 text-slate-700" /> Security PIN</CardTitle>
              <CardDescription>Secure your account with a 4-digit PIN.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Current PIN</Label>
                  <Input className="h-11 rounded-xl bg-slate-50 text-center text-xl tracking-[0.5em] font-mono" type="password" placeholder="****" maxLength={4} value={currentPin} onChange={e => setCurrentPin(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">New PIN</Label>
                  <Input className="h-11 rounded-xl bg-slate-50 text-center text-xl tracking-[0.5em] font-mono border-slate-300 focus-visible:ring-slate-500" type="password" placeholder="****" maxLength={4} value={newPin} onChange={e => setNewPin(e.target.value)} />
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="bg-slate-50/50 border-t px-6 py-4 flex-col items-stretch gap-3">
              {pinMsg && (
                <div className={`p-3 rounded-lg text-sm font-medium flex items-center gap-2 animate-in slide-in-from-bottom-2 ${pinMsg.includes('secured') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {pinMsg.includes('secured') ? <Shield className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {pinMsg}
                </div>
              )}
              <Button size="lg" variant="outline" className="w-full rounded-xl font-bold border-slate-300 hover:bg-slate-100 transition-all text-slate-700" onClick={handleUpdatePin} disabled={isUpdatingPin}>
                {isUpdatingPin ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                Update Security PIN
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Permissions Matrix */}
        <div className="xl:col-span-7 h-full">
          <Card className="border-0 shadow-lg shadow-slate-200/40 rounded-2xl bg-white overflow-hidden h-full flex flex-col relative">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-2 text-xl"><Shield className="w-5 h-5 text-emerald-500" /> Role Permissions Matrix</CardTitle>
              <CardDescription>A complete overview of module access limits across all system roles.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 px-0 pb-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold tracking-widest border-y border-slate-100">
                    <tr>
                      <th className="px-6 py-4">System Module</th>
                      <th className="px-4 py-4 text-center">Owner</th>
                      <th className="px-4 py-4 text-center">Manager</th>
                      <th className="px-4 py-4 text-center">Cashier</th>
                      <th className="px-4 py-4 text-center">Waiter</th>
                      <th className="px-4 py-4 text-center">Kitchen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {permissions.map((p, i) => (
                      <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-5 font-bold text-slate-700 group-hover:text-primary transition-colors">{p.module}</td>
                        <td className="px-4 py-5 text-center">
                          {p.owner ? <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mx-auto"><Check className="w-4 h-4 text-emerald-600 stroke-[3]" /></div> : <span className="text-slate-300 font-bold">-</span>}
                        </td>
                        <td className="px-4 py-5 text-center">
                          {p.manager ? <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mx-auto"><Check className="w-4 h-4 text-emerald-600 stroke-[3]" /></div> : <span className="text-slate-300 font-bold">-</span>}
                        </td>
                        <td className="px-4 py-5 text-center">
                          {p.cashier ? <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mx-auto"><Check className="w-4 h-4 text-emerald-600 stroke-[3]" /></div> : <span className="text-slate-300 font-bold">-</span>}
                        </td>
                        <td className="px-4 py-5 text-center">
                          {p.waiter ? <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mx-auto"><Check className="w-4 h-4 text-emerald-600 stroke-[3]" /></div> : <span className="text-slate-300 font-bold">-</span>}
                        </td>
                        <td className="px-4 py-5 text-center">
                          {p.kitchen ? <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mx-auto"><Check className="w-4 h-4 text-emerald-600 stroke-[3]" /></div> : <span className="text-slate-300 font-bold">-</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-slate-50 p-6 mt-4 border-t border-slate-100">
                <div className="flex gap-3 text-slate-500">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
                  <p className="text-sm font-medium leading-relaxed">
                    Role permissions are statically defined by the system architecture. To elevate or restrict a user's access, you must change their designated role in the <span className="font-bold text-slate-700">Employees</span> directory.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
