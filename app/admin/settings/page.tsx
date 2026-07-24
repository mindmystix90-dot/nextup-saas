'use client';

import { useEffect, useState } from 'react';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Globe,
  Bell,
  ShieldCheck,
  UserCog,
  Save,
  Plus,
  Pencil,
  Loader2,
  Sliders,
  DollarSign,
  Share2,
  ListTodo,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
import {
  fetchSystemSettings,
  updateSystemSettings,
  DEFAULT_SYSTEM_SETTINGS,
} from '@/services/system-settings.service';
import type { SystemSettings } from '@/types';

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
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const s = await fetchSystemSettings();
        setSystemSettings(s);
      } catch { /* best-effort */ } finally {
        setLoadingSettings(false);
      }
    })();
  }, []);

  async function handleSaveAll() {
    setSaving(true);
    try {
      await updateSystemSettings(systemSettings);
      toast.success('Global platform system settings saved successfully!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save system settings.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={SettingsIcon}
        title="Settings & System Config"
        subtitle="Configure platform-wide reward values, withdrawal rules, themes, and permissions."
        actions={
          <Button size="sm" className="bg-brand-gradient font-semibold" onClick={handleSaveAll} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            {saving ? 'Saving...' : 'Save All Settings'}
          </Button>
        }
      />

      {/* Global Platform Settings */}
      <Card className="card-premium border-primary/20 bg-gradient-to-br from-background via-background to-secondary/30">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Sliders className="h-5 w-5 text-primary" /> Platform Global System Settings (Firestore)
          </CardTitle>
          <CardDescription>
            Document: <code className="text-xs bg-secondary px-1.5 py-0.5 rounded">system_settings/platform</code>. All reward amounts, affiliate commissions, and withdrawal thresholds load from here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loadingSettings ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Wallet & Rewards */}
              <div className="space-y-4 rounded-xl border border-border p-4 bg-background/80">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h3 className="font-semibold text-sm flex items-center gap-1.5 text-primary">
                    <DollarSign className="h-4 w-4" /> Wallet & Rewards
                  </h3>
                  <Switch
                    checked={systemSettings.walletEnabled}
                    onCheckedChange={(v) => setSystemSettings((s) => ({ ...s, walletEnabled: v }))}
                  />
                </div>
                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <Label className="text-xs">Referral Signup Bonus (₹)</Label>
                    <Input
                      type="number"
                      value={systemSettings.rewards.referralSignupBonus}
                      onChange={(e) => setSystemSettings((s) => ({
                        ...s, rewards: { ...s.rewards, referralSignupBonus: Number(e.target.value) }
                      }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Affiliate Purchase Commission (%)</Label>
                    <Input
                      type="number"
                      value={systemSettings.rewards.affiliatePurchasePercent}
                      onChange={(e) => setSystemSettings((s) => ({
                        ...s, rewards: { ...s.rewards, affiliatePurchasePercent: Number(e.target.value) }
                      }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Daily Login Reward (₹)</Label>
                    <Input
                      type="number"
                      value={systemSettings.rewards.dailyReward}
                      onChange={(e) => setSystemSettings((s) => ({
                        ...s, rewards: { ...s.rewards, dailyReward: Number(e.target.value) }
                      }))}
                    />
                  </div>
                </div>
              </div>

              {/* Withdrawal Rules */}
              <div className="space-y-4 rounded-xl border border-border p-4 bg-background/80">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h3 className="font-semibold text-sm flex items-center gap-1.5 text-primary">
                    <ShieldCheck className="h-4 w-4" /> Withdrawal Controls
                  </h3>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Auto Approve</Label>
                    <Switch
                      checked={systemSettings.withdrawals.autoApprove}
                      onCheckedChange={(v) => setSystemSettings((s) => ({
                        ...s, withdrawals: { ...s.withdrawals, autoApprove: v }
                      }))}
                    />
                  </div>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Min Withdrawal (₹)</Label>
                      <Input
                        type="number"
                        value={systemSettings.withdrawals.minimumWithdraw}
                        onChange={(e) => setSystemSettings((s) => ({
                          ...s, withdrawals: { ...s.withdrawals, minimumWithdraw: Number(e.target.value) }
                        }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Max Withdrawal (₹)</Label>
                      <Input
                        type="number"
                        value={systemSettings.withdrawals.maximumWithdraw}
                        onChange={(e) => setSystemSettings((s) => ({
                          ...s, withdrawals: { ...s.withdrawals, maximumWithdraw: Number(e.target.value) }
                        }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Withdrawal Fee</Label>
                      <Input
                        type="number"
                        value={systemSettings.withdrawals.withdrawalFee}
                        onChange={(e) => setSystemSettings((s) => ({
                          ...s, withdrawals: { ...s.withdrawals, withdrawalFee: Number(e.target.value) }
                        }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Fee Type</Label>
                      <Select
                        value={systemSettings.withdrawals.withdrawalFeeType}
                        onValueChange={(v: 'percentage' | 'fixed') => setSystemSettings((s) => ({
                          ...s, withdrawals: { ...s.withdrawals, withdrawalFeeType: v }
                        }))}
                      >
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage (%)</SelectItem>
                          <SelectItem value="fixed">Fixed (₹)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Affiliate & Microtasks */}
              <div className="space-y-4 rounded-xl border border-border p-4 bg-background/80">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h3 className="font-semibold text-sm flex items-center gap-1.5 text-primary">
                    <Share2 className="h-4 w-4" /> Affiliate & Microtasks
                  </h3>
                  <Switch
                    checked={systemSettings.affiliate.enabled}
                    onCheckedChange={(v) => setSystemSettings((s) => ({
                      ...s, affiliate: { ...s.affiliate, enabled: v }
                    }))}
                  />
                </div>
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Cookie Days</Label>
                      <Input
                        type="number"
                        value={systemSettings.affiliate.cookieDurationDays}
                        onChange={(e) => setSystemSettings((s) => ({
                          ...s, affiliate: { ...s.affiliate, cookieDurationDays: Number(e.target.value) }
                        }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Attribution</Label>
                      <Select
                        value={systemSettings.affiliate.attribution}
                        onValueChange={(v: 'first_click' | 'last_click') => setSystemSettings((s) => ({
                          ...s, affiliate: { ...s.affiliate, attribution: v }
                        }))}
                      >
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="first_click">First Click</SelectItem>
                          <SelectItem value="last_click">Last Click</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <Label className="text-xs font-semibold flex items-center gap-1">
                      <ListTodo className="h-3.5 w-3.5" /> Microtasks Minimum (₹)
                    </Label>
                    <Input
                      type="number"
                      className="w-24 text-right h-8"
                      value={systemSettings.microtasks.minimumWithdraw}
                      onChange={(e) => setSystemSettings((s) => ({
                        ...s, microtasks: { ...s.microtasks, minimumWithdraw: Number(e.target.value) }
                      }))}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
            <Button variant="outline" size="sm" className="w-full" onClick={() => toast.success('Profile saved')}>
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
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" /> Admin permissions
              </CardTitle>
              <CardDescription>Team members with admin access.</CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={() => toast.info('Invite admin')}>
              <Plus className="h-4 w-4 mr-1" /> Invite admin
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 font-semibold">Member</th>
                    <th className="px-4 py-3 font-semibold">Role</th>
                    <th className="px-4 py-3 font-semibold">Permissions</th>
                    <th className="px-4 py-3 font-semibold text-right">Last active</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{user?.name || 'NextUp Admin'}</p>
                      <p className="text-xs text-muted-foreground">{user?.email || 'admin@nextup.in'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="default">Super Admin</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {['All Access', 'User Management', 'Billing', 'CMS', 'Settings'].map((perm) => (
                          <Badge key={perm} variant="outline" className="text-xs">{perm}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">Just now</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.info('Current active admin account')}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
