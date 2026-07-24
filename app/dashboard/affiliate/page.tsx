'use client';

import { useEffect, useState } from 'react';
import {
  Network,
  MousePointerClick,
  UserPlus,
  ShoppingBag,
  Clock,
  IndianRupee,
  Loader2,
  Copy,
  Users,
  QrCode,
  Sparkles,
  PackageCheck,
  TrendingUp,
  Download,
  Percent,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { subscribeAffiliateStats, subscribeReferrals } from '@/services/affiliate.service';
import { fetchPackages, subscribePackages } from '@/services/packages.service';
import { fetchPackageOrdersForAffiliate } from '@/services/commission.service';
import { formatINR } from '@/services/wallet.service';
import type { AffiliateStats, Referral, MembershipPackage, PackageAffiliateOrder } from '@/types';

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <Card className="card-premium">
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <h3 className="text-xl font-bold tracking-tight mt-1">{value}</h3>
        </div>
        <div className={`h-9 w-9 rounded-xl bg-secondary flex items-center justify-center ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function AffiliatePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [packages, setPackages] = useState<MembershipPackage[]>([]);
  const [packageOrders, setPackageOrders] = useState<PackageAffiliateOrder[]>([]);

  // QR Code Modal State
  const [qrModalPackage, setQrModalPackage] = useState<{ name: string; url: string } | null>(null);

  useEffect(() => {
    if (!user?.uid) return;

    // Load initial packages and package orders
    (async () => {
      try {
        const pOrders = await fetchPackageOrdersForAffiliate(user.uid);
        setPackageOrders(pOrders);
      } catch {
        /* best-effort */
      } finally {
        setLoading(false);
      }
    })();

    // Subscriptions
    const unsubStats = subscribeAffiliateStats(user.uid, (s) => setStats(s));
    const unsubRefs = subscribeReferrals(user.uid, (r) => setReferrals(r));
    const unsubPkgs = subscribePackages((pkgs) => setPackages(pkgs.filter((p) => p.status === 'active')));

    return () => {
      unsubStats();
      unsubRefs();
      unsubPkgs();
    };
  }, [user?.uid]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://nextupacademy.in';
  const mainReferralLink = stats ? `${baseUrl}/register?ref=${stats.referralCode}` : '';

  function copyText(text: string, msg: string) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(msg);
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient-soft text-primary">
              <Network className="h-5 w-5" />
            </span>
            Affiliate Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Share package-specific referral links, track sales conversions, and earn automatic wallet commissions.
          </p>
        </div>

        {/* Global Referral Card */}
        <Card className="card-premium overflow-hidden">
          <div className="bg-slate-950 p-6 text-white relative">
            <div className="absolute inset-0 bg-brand-gradient opacity-15 blur-[80px] pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Your Primary Referral Link</p>
                <Badge variant="outline" className="border-white/20 text-white text-[10px]">
                  Code: {stats?.referralCode || '...'}
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 rounded-xl bg-white/10 px-4 py-3 font-mono text-sm truncate border border-white/10">
                  {mainReferralLink || 'Loading...'}
                </div>
                <Button onClick={() => copyText(mainReferralLink, 'Primary link copied!')} className="bg-brand-gradient font-semibold">
                  <Copy className="mr-2 h-4 w-4" /> Copy Link
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setQrModalPackage({ name: 'General Registration', url: mainReferralLink })}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <QrCode className="mr-2 h-4 w-4" /> QR Code
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={MousePointerClick} label="Clicks" value={String(stats?.clicks ?? 0)} color="text-blue-500" />
          <StatCard icon={UserPlus} label="Registrations" value={String(stats?.registrations ?? 0)} color="text-emerald-500" />
          <StatCard icon={ShoppingBag} label="Total Sales" value={String(stats?.sales ?? 0)} color="text-primary" />
          <StatCard icon={IndianRupee} label="Available Balance" value={`₹${formatINR(stats?.availableBalance ?? 0)}`} color="text-purple-500" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard icon={Clock} label="Pending Commission" value={`₹${formatINR(stats?.pendingCommission ?? 0)}`} color="text-amber-500" />
          <StatCard icon={PackageCheck} label="Paid Commission" value={`₹${formatINR(stats?.paidCommission ?? 0)}`} color="text-emerald-500" />
        </div>

        {/* PACKAGE-SPECIFIC AFFILIATE TRACKING */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Package-Specific Affiliate Links
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Target specific membership tiers directly with unique tracked links, QR codes, and custom commission rates.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {packages.map((pkg) => {
              const packageUrl = `${baseUrl}/register?ref=${stats?.referralCode}&package=${pkg.slug}`;

              // Calculations for this package
              const pkgSales = packageOrders.filter((po) => po.packageId === pkg.id);
              const pkgEarnings = pkgSales.reduce((sum, po) => sum + po.commissionAmount + po.bonusAmount, 0);

              return (
                <Card key={pkg.id} className="card-premium flex flex-col justify-between hover:border-primary/40 transition-all">
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <Badge className="bg-primary/10 text-primary border-primary/20 font-bold text-xs">
                        {pkg.affiliateCommissionPercent}% Commission
                      </Badge>
                      {pkg.salesBadge && (
                        <Badge variant="outline" className="text-[10px] font-semibold border-amber-500/30 text-amber-600 dark:text-amber-400">
                          {pkg.salesBadge}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg font-bold flex items-center justify-between">
                      <span>{pkg.name}</span>
                      <span className="text-base text-primary">₹{formatINR(pkg.price)}</span>
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-2 mt-1">
                      {pkg.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-5 pt-0 space-y-4">
                    {/* Performance metrics for this package */}
                    <div className="grid grid-cols-3 gap-2 bg-secondary/40 rounded-xl p-3 text-center">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Sales</p>
                        <p className="font-bold text-sm mt-0.5">{pkgSales.length}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Bonus</p>
                        <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400 mt-0.5">+₹{pkg.bonusReward}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Earned</p>
                        <p className="font-bold text-sm text-primary mt-0.5">₹{formatINR(pkgEarnings)}</p>
                      </div>
                    </div>

                    {/* URL Input Box */}
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-semibold text-muted-foreground">Affiliate Link:</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 rounded-lg bg-background border px-3 py-2 text-xs font-mono truncate text-muted-foreground">
                          {packageUrl}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => copyText(packageUrl, `${pkg.name} referral link copied!`)}
                          className="bg-brand-gradient text-xs"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setQrModalPackage({ name: pkg.name, url: packageUrl })}
                          className="text-xs"
                        >
                          <QrCode className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* PACKAGE ORDERS TABLE */}
        <Card className="card-premium p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" /> Package Sales History
            </CardTitle>
            <CardDescription>
              Every customer order made through your package referral links.
            </CardDescription>
          </CardHeader>

          {packageOrders.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/30 mb-2" />
              <p className="font-medium text-sm">No package sales recorded yet</p>
              <p className="text-xs mt-1">Share your package referral links above to earn high commissions.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 font-semibold">Buyer Name</th>
                    <th className="px-4 py-3 font-semibold">Package Tiers</th>
                    <th className="px-4 py-3 font-semibold">Price</th>
                    <th className="px-4 py-3 font-semibold">Commission</th>
                    <th className="px-4 py-3 font-semibold">Bonus</th>
                    <th className="px-4 py-3 font-semibold text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {packageOrders.map((ord) => (
                    <tr key={ord.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-medium">{ord.buyerName}</p>
                        <p className="text-[11px] text-muted-foreground">{ord.buyerEmail}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="font-semibold text-xs">
                          {ord.packageName}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-mono">₹{formatINR(ord.packagePrice)}</td>
                      <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{formatINR(ord.commissionAmount)} ({ord.commissionRate}%)
                      </td>
                      <td className="px-4 py-3 font-bold text-blue-600 dark:text-blue-400">
                        +₹{formatINR(ord.bonusAmount)}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                        {new Date(ord.purchaseTime).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* QR Code Dialog */}
        <Dialog open={!!qrModalPackage} onOpenChange={(open) => !open && setQrModalPackage(null)}>
          <DialogContent className="max-w-sm text-center">
            <DialogHeader>
              <DialogTitle>{qrModalPackage?.name} QR Code</DialogTitle>
              <DialogDescription>
                Scan or download this QR code to promote this package directly.
              </DialogDescription>
            </DialogHeader>

            {qrModalPackage && (
              <div className="space-y-4 py-4 flex flex-col items-center">
                <div className="p-4 bg-white rounded-2xl shadow-md border border-border inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                      qrModalPackage.url
                    )}`}
                    alt="Affiliate QR Code"
                    className="w-48 h-48"
                  />
                </div>

                <p className="text-xs font-mono text-muted-foreground break-all px-4">
                  {qrModalPackage.url}
                </p>

                <Button
                  onClick={() => {
                    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
                      qrModalPackage.url
                    )}`;
                    window.open(qrUrl, '_blank');
                  }}
                  className="bg-brand-gradient w-full font-semibold"
                >
                  <Download className="mr-2 h-4 w-4" /> Download High-Res QR
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
