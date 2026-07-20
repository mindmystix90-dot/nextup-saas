'use client';

import { useState } from 'react';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Languages,
  Bell,
  ShieldCheck,
  UserCog,
  RotateCcw,
  Save,
  Globe,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSettings } from '@/hooks/use-settings';
import { useAuth } from '@/hooks/use-auth';
import { languages, notificationPreferences, privacyPreferences } from '@/lib/data/settings';
import { toast } from 'sonner';

const THEMES = [
  { key: 'light', label: 'Light', icon: Sun },
  { key: 'dark', label: 'Dark', icon: Moon },
  { key: 'system', label: 'System', icon: Globe },
] as const;

export default function SettingsPage() {
  const { settings, update, toggleNotification, togglePrivacy, reset } = useSettings();
  const { user, logout } = useAuth();
  const [saving, setSaving] = useState(false);

  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Settings saved.');
    }, 300);
  }

  function handleReset() {
    reset();
    toast.success('Settings reset to defaults.');
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient-soft text-primary">
            <SettingsIcon className="h-5 w-5" />
          </span>
          Settings
        </h1>
        <p className="mt-2 text-muted-foreground">Manage your preferences, privacy, and account.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Theme */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Moon className="h-5 w-5 text-primary" /> Theme
            </CardTitle>
            <CardDescription>Choose how NextUp looks to you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {THEMES.map((t) => {
              const Icon = t.icon;
              const active = settings.theme === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => {
                    update({ theme: t.key });
                    toast.success(`Theme set to ${t.label}.`);
                  }}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-4 transition-all ${
                    active ? 'border-primary/40 bg-brand-gradient-soft' : 'border-border hover:border-primary/30'
                  }`}
                >
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${active ? 'bg-brand-gradient text-white' : 'bg-secondary text-muted-foreground'}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1 text-left text-sm font-semibold">{t.label}</span>
                  {active && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Language */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Languages className="h-5 w-5 text-primary" /> Language
            </CardTitle>
            <CardDescription>Choose your preferred language.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Display language</Label>
              <Select
                value={settings.language}
                onValueChange={(v) => {
                  update({ language: v });
                  const lang = languages.find((l) => l.code === v);
                  toast.success(`Language set to ${lang?.label}.`);
                }}
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((l) => (
                    <SelectItem key={l.code} value={l.code}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">More languages are added regularly. Currency is always shown in ₹ (INR).</p>
          </CardContent>
        </Card>

        {/* Account */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserCog className="h-5 w-5 text-primary" /> Account
            </CardTitle>
            <CardDescription>Your account details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-border p-4">
              <p className="text-xs text-muted-foreground">Signed in as</p>
              <p className="mt-1 text-sm font-semibold">{user?.name || 'Guest'}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button variant="outline" className="w-full font-semibold" onClick={() => toast.message('Export is a demo feature.')}>
              Export my data
            </Button>
            <Button
              variant="outline"
              className="w-full font-semibold text-destructive hover:text-destructive"
              onClick={() => {
                logout();
                toast.success('Signed out successfully.');
              }}
            >
              Sign out
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="card-premium lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" /> Notifications
            </CardTitle>
            <CardDescription>Choose what you want to be notified about.</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {notificationPreferences.map((n) => (
              <div key={n.key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="pr-4">
                  <p className="text-sm font-semibold">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.description}</p>
                </div>
                <Switch
                  checked={settings.notifications[n.key] ?? n.defaultEnabled}
                  onCheckedChange={() => {
                    toggleNotification(n.key);
                  }}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card className="card-premium lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> Privacy
            </CardTitle>
            <CardDescription>Control how your data and profile are used.</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {privacyPreferences.map((p) => (
              <div key={p.key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="pr-4">
                  <p className="text-sm font-semibold">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.description}</p>
                </div>
                <Switch
                  checked={settings.privacy[p.key] ?? p.defaultEnabled}
                  onCheckedChange={() => {
                    togglePrivacy(p.key);
                  }}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-end">
        <Button variant="outline" className="font-semibold" onClick={handleReset}>
          <RotateCcw className="mr-2 h-4 w-4" /> Reset to defaults
        </Button>
        <Button className="bg-brand-gradient font-semibold" onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" /> {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </DashboardLayout>
  );
}
