'use client';

import { useState } from 'react';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Globe,
  Bell,
  ShieldCheck,
  UserCog,
  Save,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

const THEMES = [
  { key: 'light', label: 'Light', icon: Sun },
  { key: 'dark', label: 'Dark', icon: Moon },
  { key: 'system', label: 'System', icon: Globe },
] as const;

const ADMIN_NOTIFICATIONS = [
  { key: 'new_signups', title: 'New signups', description: 'Notify when a user registers.', defaultEnabled: true },
  { key: 'course_reviews', title: 'Course reviews', description: 'Notify when a course gets a new review.', defaultEnabled: true },
  { key: 'payouts', title: 'Affiliate payouts', description: 'Notify when an affiliate requests payout.', defaultEnabled: true },
  { key: 'flagged_posts', title: 'Flagged community posts', description: 'Notify when a post is reported.', defaultEnabled: true },
  { key: 'failed_payments', title: 'Failed payments', description: 'Notify when a transaction fails.', defaultEnabled: false },
  { key: 'weekly_digest', title: 'Weekly digest', description: 'Send a weekly admin summary email.', defaultEnabled: true },
];

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [notifications, setNotifications] = useState<Record<string, boolean>>(
    Object.fromEntries(ADMIN_NOTIFICATIONS.map((n) => [n.key, n.defaultEnabled]))
  );
  const [saving, setSaving] = useState(false);

  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Admin settings saved. Connect Firestore persistence in the Settings module.');
    }, 300);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={SettingsIcon}
        title="Settings"
        subtitle="Theme, notifications, profile and admin permissions."
        actions={
          <Button size="sm" className="bg-brand-gradient font-semibold" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-1" /> {saving ? 'Saving…' : 'Save changes'}
          </Button>
        }
      />

      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        {/* Theme */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Moon className="h-5 w-5 text-primary" /> Theme
            </CardTitle>
            <CardDescription>Default admin interface theme.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {THEMES.map((t) => {
              const Icon = t.icon;
              const active = theme === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => {
                    setTheme(t.key);
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

        {/* Profile */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserCog className="h-5 w-5 text-primary" /> Profile
            </CardTitle>
            <CardDescription>Your admin profile.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-brand-gradient text-white font-semibold">
                  {(user?.name || 'A').split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{user?.name || 'NextUp Admin'}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admin-name">Display name</Label>
              <Input id="admin-name" defaultValue={user?.name || 'NextUp Admin'} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admin-email">Email</Label>
              <Input id="admin-email" defaultValue={user?.email || 'admin@nextup.in'} />
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={() => toast.success('Profile saved locally. Connect Firestore persistence in the Settings module.')}>
              Save profile
            </Button>
          </CardContent>
        </Card>

        {/* Localization */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" /> Localization
            </CardTitle>
            <CardDescription>Default language and currency.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Default language</Label>
              <Select defaultValue="en">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="ta">Tamil</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Select defaultValue="inr">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="inr">₹ Indian Rupee (INR)</SelectItem>
                  <SelectItem value="usd">$ US Dollar (USD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Timezone</Label>
              <Select defaultValue="ist">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ist">Asia/Kolkata (IST)</SelectItem>
                  <SelectItem value="utc">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="card-premium lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" /> Admin notifications
            </CardTitle>
            <CardDescription>Choose what the admin team is notified about.</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {ADMIN_NOTIFICATIONS.map((n) => (
              <div key={n.key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="pr-4">
                  <p className="text-sm font-semibold">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.description}</p>
                </div>
                <Switch
                  checked={notifications[n.key]}
                  onCheckedChange={(v) => setNotifications((s) => ({ ...s, [n.key]: v }))}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card className="card-premium lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> Admin permissions
            </CardTitle>
            <CardDescription>Admin access is loaded from the authenticated Firebase user profile.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border border-border p-4">
              <p className="text-sm font-semibold text-foreground">{user?.name || 'Current admin'}</p>
              <p className="text-xs text-muted-foreground">{user?.email || 'No email available'}</p>
              <p className="mt-3 text-sm text-muted-foreground">
                Role: <span className="font-medium text-foreground">{user?.role || 'admin'}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
