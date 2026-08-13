import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, User, Key, Check, Loader2 } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

export default function AccountPermissionsPage() {
  const { currentUser, login } = useAppStore();
  
  const [firstName, setFirstName] = useState(currentUser?.firstName || '');
  const [lastName, setLastName] = useState(currentUser?.lastName || '');
  const [email, setEmail] = useState((currentUser as any)?.email || '');
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
    if (!firstName || !lastName) {
      setProfileMsg('First and last name are required');
      return;
    }
    
    setIsUpdatingProfile(true);
    setProfileMsg('');
    
    try {
      const res = await axios.put('/api/auth/update-profile', {
        userId: currentUser?.id,
        firstName,
        lastName,
        email
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
        
        setProfileMsg('Profile updated successfully!');
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
        setPinMsg('PIN updated successfully!');
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
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account & Permissions</h1>
          <p className="text-muted-foreground mt-1">Manage your profile and view system roles.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-primary" /> My Profile</CardTitle>
              <CardDescription>Update your personal account details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={firstName} onChange={e => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={lastName} onChange={e => setLastName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input value={currentUser?.role || ''} disabled className="bg-muted capitalize font-medium" />
              </div>
              
              {profileMsg && (
                <p className={`text-sm ${profileMsg.includes('success') ? 'text-emerald-500' : 'text-destructive'}`}>
                  {profileMsg}
                </p>
              )}
              
              <Button className="w-full mt-2" onClick={handleUpdateProfile} disabled={isUpdatingProfile}>
                {isUpdatingProfile ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Profile
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Key className="w-5 h-5 text-primary" /> Security</CardTitle>
              <CardDescription>Change your login PIN.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current PIN</Label>
                <Input type="password" placeholder="****" maxLength={4} value={currentPin} onChange={e => setCurrentPin(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>New PIN</Label>
                <Input type="password" placeholder="****" maxLength={4} value={newPin} onChange={e => setNewPin(e.target.value)} />
              </div>
              
              {pinMsg && (
                <p className={`text-sm ${pinMsg.includes('success') ? 'text-emerald-500' : 'text-destructive'}`}>
                  {pinMsg}
                </p>
              )}
              
              <Button variant="outline" className="w-full mt-2" onClick={handleUpdatePin} disabled={isUpdatingPin}>
                {isUpdatingPin ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Update PIN
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Role Permissions</CardTitle>
              <CardDescription>Overview of access levels across the system.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground uppercase text-xs font-semibold">
                      <tr>
                        <th className="px-4 py-3">Module</th>
                        <th className="px-4 py-3 text-center text-primary">Owner</th>
                        <th className="px-4 py-3 text-center">Manager</th>
                        <th className="px-4 py-3 text-center">Cashier</th>
                        <th className="px-4 py-3 text-center">Waiter</th>
                        <th className="px-4 py-3 text-center">Kitchen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {permissions.map((p, i) => (
                        <tr key={i} className="hover:bg-muted/50 transition-colors">
                          <td className="px-4 py-3 font-medium">{p.module}</td>
                          <td className="px-4 py-3 text-center">{p.owner ? <Check className="w-4 h-4 mx-auto text-emerald-500" /> : <span className="text-muted-foreground">-</span>}</td>
                          <td className="px-4 py-3 text-center">{p.manager ? <Check className="w-4 h-4 mx-auto text-emerald-500" /> : <span className="text-muted-foreground">-</span>}</td>
                          <td className="px-4 py-3 text-center">{p.cashier ? <Check className="w-4 h-4 mx-auto text-emerald-500" /> : <span className="text-muted-foreground">-</span>}</td>
                          <td className="px-4 py-3 text-center">{p.waiter ? <Check className="w-4 h-4 mx-auto text-emerald-500" /> : <span className="text-muted-foreground">-</span>}</td>
                          <td className="px-4 py-3 text-center">{p.kitchen ? <Check className="w-4 h-4 mx-auto text-emerald-500" /> : <span className="text-muted-foreground">-</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Note: Role permissions are currently fixed per system architecture. To modify user access, please edit their role assignment in the Employees section.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
