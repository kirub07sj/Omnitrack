import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Save, ChefHat } from 'lucide-react';

export default function SettingsPage() {
  const { businessSettings, updateBusinessSettings } = useAppStore();
  
  const [isKitchenActive, setIsKitchenActive] = useState(businessSettings?.is_kitchen_active ?? true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/business/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_kitchen_active: isKitchenActive })
      });
      const data = await res.json();
      
      if (data.success) {
        updateBusinessSettings(data.business);
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to save settings' });
      }
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      setMessage({ type: 'error', text: 'Network error occurred' });
      setTimeout(() => setMessage(null), 3000);
    }
    setIsSaving(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
      </div>

      {/* Fixed Toast Notifications */}
      {message && (
        <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 animate-in slide-in-from-top-5">
          <div className={`px-4 py-3 rounded-xl shadow-lg font-medium text-sm flex items-center ${message.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-destructive text-destructive-foreground'}`}>
            {message.type === 'success' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
            )}
            {message.text}
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ChefHat className="w-5 h-5 text-primary" /> Operational Modules</CardTitle>
          <CardDescription>Configure which modules are active for your business workflow.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="flex items-center justify-between p-4 border rounded-xl">
            <div>
              <h3 className="font-semibold text-lg">Kitchen Module</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Enable this if you have a kitchen display/printer and want orders to be sent to the kitchen as "Pending". Disable this if waiters tell the kitchen directly, and you only want to use the POS for direct checkouts.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={isKitchenActive}
                onChange={(e) => setIsKitchenActive(e.target.checked)}
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
