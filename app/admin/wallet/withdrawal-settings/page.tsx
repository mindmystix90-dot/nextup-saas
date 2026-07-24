'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sliders,
  Shield,
  Clock,
  IndianRupee,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Save,
  Loader2,
  MessageSquare,
  Lock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { toast } from 'sonner';
import {
  fetchWithdrawalSettings,
  updateWithdrawalSettings,
  DEFAULT_WITHDRAWAL_SETTINGS,
} from '@/services/withdrawal-settings.service';
import { useAuth } from '@/hooks/use-auth';
import type { GlobalWithdrawalSettings } from '@/types';

export default function GlobalWithdrawalSettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<GlobalWithdrawalSettings>(DEFAULT_WITHDRAWAL_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const s = await fetchWithdrawalSettings();
        setSettings(s);
      } catch {
        toast.error('Failed to load global withdrawal settings');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await updateWithdrawalSettings(settings, {
        uid: user?.uid || 'admin',
        name: user?.name || user?.email || 'Admin',
      });
      toast.success('Global Withdrawal Settings updated successfully!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <AdminPageHeader
        title="Global Withdrawal Settings"
        subtitle="Manage platform-wide withdrawal rules, limits, maintenance modes, and security policies stored in system_settings/platform."
        actions={
          <div className="flex items-center gap-2">
            <Link href="/admin/wallet">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Wallet
              </Button>
            </Link>
            <Button size="sm" onClick={handleSave} disabled={saving} className="bg-brand-gradient text-white">
              {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
              Save Settings
            </Button>
          </div>
        }
      />

      {/* Main Switch Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" /> Operational Controls
            </CardTitle>
            <CardDescription>Enable or pause withdrawal processing platform-wide.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-2 p-3 bg-secondary/30 rounded-xl">
              <div>
                <Label className="font-semibold text-sm">Enable Withdrawals</Label>
                <p className="text-xs text-muted-foreground">Allow users to submit new withdrawal requests.</p>
              </div>
              <Switch
                checked={settings.withdrawalsEnabled}
                onCheckedChange={(val) => setSettings((s) => ({ ...s, withdrawalsEnabled: val }))}
              />
            </div>

            <div className="flex items-center justify-between space-x-2 p-3 bg-secondary/30 rounded-xl">
              <div>
                <Label className="font-semibold text-sm">Maintenance Mode</Label>
                <p className="text-xs text-muted-foreground">Pause withdrawals with custom admin banner notice.</p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(val) => setSettings((s) => ({ ...s, maintenanceMode: val }))}
              />
            </div>

            <div className="flex items-center justify-between space-x-2 p-3 bg-secondary/30 rounded-xl">
              <div>
                <Label className="font-semibold text-sm">Require Verified KYC</Label>
                <p className="text-xs text-muted-foreground">Enforce identity verification before withdrawal.</p>
              </div>
              <Switch
                checked={settings.requireKYC}
                onCheckedChange={(val) => setSettings((s) => ({ ...s, requireKYC: val }))}
              />
            </div>

            <div className="flex items-center justify-between space-x-2 p-3 bg-secondary/30 rounded-xl">
              <div>
                <Label className="font-semibold text-sm">Auto Approve Withdrawals</Label>
                <p className="text-xs text-muted-foreground">Automatically approve requests without manual review.</p>
              </div>
              <Switch
                checked={settings.autoApprove}
                onCheckedChange={(val) => setSettings((s) => ({ ...s, autoApprove: val }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Calendar & Timing Rules */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" /> Schedule & Timing Rules
            </CardTitle>
            <CardDescription>Configure weekend and holiday payout schedules.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-2 p-3 bg-secondary/30 rounded-xl">
              <div>
                <Label className="font-semibold text-sm">Allow Weekend Withdrawals</Label>
                <p className="text-xs text-muted-foreground">Allow user requests on Saturdays and Sundays.</p>
              </div>
              <Switch
                checked={settings.allowWeekendWithdrawals}
                onCheckedChange={(val) => setSettings((s) => ({ ...s, allowWeekendWithdrawals: val }))}
              />
            </div>

            <div className="flex items-center justify-between space-x-2 p-3 bg-secondary/30 rounded-xl">
              <div>
                <Label className="font-semibold text-sm">Allow Holiday Withdrawals</Label>
                <p className="text-xs text-muted-foreground">Process payouts during public holidays.</p>
              </div>
              <Switch
                checked={settings.allowHolidayWithdrawals}
                onCheckedChange={(val) => setSettings((s) => ({ ...s, allowHolidayWithdrawals: val }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Withdrawal Cooldown (Hours)</Label>
              <Input
                type="number"
                value={settings.withdrawalCooldownHours}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, withdrawalCooldownHours: Number(e.target.value) }))
                }
                className="h-9 text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                Minimum wait time between consecutive requests by the same user.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Limits & Amounts */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <IndianRupee className="h-5 w-5 text-primary" /> Limits & Thresholds
          </CardTitle>
          <CardDescription>Set global minimum, maximum, daily, and count limits for all users.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Global Minimum Withdrawal (₹)</Label>
            <Input
              type="number"
              value={settings.globalMinimumWithdrawal}
              onChange={(e) =>
                setSettings((s) => ({ ...s, globalMinimumWithdrawal: Number(e.target.value) }))
              }
              className="h-9 font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold">Global Maximum Withdrawal (₹)</Label>
            <Input
              type="number"
              value={settings.globalMaximumWithdrawal}
              onChange={(e) =>
                setSettings((s) => ({ ...s, globalMaximumWithdrawal: Number(e.target.value) }))
              }
              className="h-9 font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold">Maximum Pending Requests</Label>
            <Input
              type="number"
              value={settings.maximumPendingWithdrawals}
              onChange={(e) =>
                setSettings((s) => ({ ...s, maximumPendingWithdrawals: Number(e.target.value) }))
              }
              className="h-9 font-mono text-sm"
            />
            <p className="text-[11px] text-muted-foreground">Max unfulfilled requests per user.</p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold">Daily User Withdrawal Limit (₹)</Label>
            <Input
              type="number"
              value={settings.dailyWithdrawalLimit}
              onChange={(e) =>
                setSettings((s) => ({ ...s, dailyWithdrawalLimit: Number(e.target.value) }))
              }
              className="h-9 font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold">Weekly User Withdrawal Limit (₹)</Label>
            <Input
              type="number"
              value={settings.weeklyWithdrawalLimit}
              onChange={(e) =>
                setSettings((s) => ({ ...s, weeklyWithdrawalLimit: Number(e.target.value) }))
              }
              className="h-9 font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Admin Maintenance Message */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" /> Admin Notice Message
          </CardTitle>
          <CardDescription>
            This message is automatically displayed to users if withdrawals are disabled or in maintenance mode.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={3}
            value={settings.adminMessage}
            onChange={(e) => setSettings((s) => ({ ...s, adminMessage: e.target.value }))}
            placeholder="e.g. Withdrawal requests are currently undergoing scheduled maintenance and will resume at 6:00 PM."
            className="text-sm"
          />
        </CardContent>
      </Card>

      {/* Save Button Bar */}
      <div className="flex justify-end pt-4">
        <Button size="lg" onClick={handleSave} disabled={saving} className="bg-brand-gradient text-white px-8">
          {saving ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
          Save Platform Withdrawal Settings
        </Button>
      </div>
    </div>
  );
}
