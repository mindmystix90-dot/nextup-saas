import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Bell, Mail, Smartphone, Megaphone, Palette, Globe, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Card, Spinner, Button } from '@/components/ui';
import { fetchSettings, updateSettings } from '@/services/general.service';
import type { UserSettings } from '@/types';

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const s = await fetchSettings(user.id);
        setSettings(s);
      } catch {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const update = (field: keyof UserSettings, value: string | boolean) => {
    setSettings((s) => (s ? { ...s, [field]: value } : s));
  };

  const handleSave = async () => {
    if (!user || !settings) return;
    setSaving(true);
    const res = await updateSettings(user.id, {
      email_notifications: settings.email_notifications,
      push_notifications: settings.push_notifications,
      sms_notifications: settings.sms_notifications,
      marketing_emails: settings.marketing_emails,
      theme: settings.theme,
      language: settings.language,
    });
    setSaving(false);
    if (res.error) { toast.error(res.error); return; }
    toast.success('Settings saved!');
  };

  if (loading) return <Spinner />;

  const prefs = [
    { key: 'email_notifications' as const, label: 'Email Notifications', icon: Mail, desc: 'Receive notifications via email' },
    { key: 'push_notifications' as const, label: 'Push Notifications', icon: Bell, desc: 'Receive browser push notifications' },
    { key: 'sms_notifications' as const, label: 'SMS Notifications', icon: Smartphone, desc: 'Receive notifications via SMS' },
    { key: 'marketing_emails' as const, label: 'Marketing Emails', icon: Megaphone, desc: 'Receive promotional and update emails' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your notification and display preferences.</p>
      </div>

      <Card>
        <h2 className="font-semibold font-display mb-4">Notification Preferences</h2>
        <div className="space-y-3">
          {prefs.map((p) => (
            <label key={p.key} className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-secondary/30 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/50">
                  <p.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{p.label}</p>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings?.[p.key] ?? false}
                onClick={() => update(p.key, !(settings?.[p.key] ?? false))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${settings?.[p.key] ? 'bg-primary' : 'bg-secondary'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${settings?.[p.key] ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </label>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold font-display mb-4">Display Preferences</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-2"><Palette className="h-4 w-4" /> Theme</label>
            <select
              value={settings?.theme ?? 'system'}
              onChange={(e) => update('theme', e.target.value)}
              className="input-field"
            >
              <option value="system">System Default</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-2"><Globe className="h-4 w-4" /> Language</label>
            <select
              value={settings?.language ?? 'en'}
              onChange={(e) => update('language', e.target.value)}
              className="input-field"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="ta">Tamil</option>
              <option value="te">Telugu</option>
              <option value="kn">Kannada</option>
            </select>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
