'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Network,
  Sparkles,
  TrendingUp,
  Wallet,
  CheckCircle2,
  Users,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Navbar } from '@/components/site/navbar';
import { Footer } from '@/components/site/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { applyForAffiliateProgram } from '@/services/affiliate.service';
import { toast } from 'sonner';

export default function PublicAffiliatePage() {
  const { user } = useAuth();
  const [referralCount, setReferralCount] = useState(15);
  const [packageChoice, setPackageChoice] = useState<'pro' | 'lifetime'>('pro');

  // Application Modal
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [website, setWebsite] = useState('');
  const [promotionMethods, setPromotionMethods] = useState('');
  const [monthlyReach, setMonthlyReach] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // FAQ collapse
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const price = packageChoice === 'pro' ? 999 : 4999;
  const commissionRate = 0.2; // 20%
  const monthlyEarnings = Math.round(referralCount * price * commissionRate);

  const handleApply = async () => {
    if (!user) {
      toast.error('Please log in or register to join the affiliate program.');
      return;
    }
    if (!promotionMethods.trim()) {
      toast.error('Please describe how you plan to promote NextUp.');
      return;
    }

    setSubmitting(true);
    try {
      await applyForAffiliateProgram(user.uid, user.name || 'Partner', user.email, {
        website: website.trim(),
        promotionMethods: promotionMethods.trim(),
        monthlyReach: monthlyReach.trim(),
      });
      toast.success('Affiliate application submitted! Our team will review it within 24 hours.');
      setIsApplyOpen(false);
    } catch {
      toast.error('Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  const faqs = [
    {
      q: 'How much commission can I earn?',
      a: 'NextUp affiliates earn a competitive 20% recurring or flat commission on every valid course or package purchase made through their unique referral link.',
    },
    {
      q: 'How long does the referral cookie last?',
      a: 'We offer an industry-leading 90-day cookie duration. If a visitor clicks your link and purchases anytime within 90 days, you get credited.',
    },
    {
      q: 'When and how do I get paid?',
      a: 'Payouts are processed manually every week directly to your UPI ID or Indian Bank Account with zero transaction fees.',
    },
    {
      q: 'Do I need a large social following to apply?',
      a: 'No! Whether you are a content creator, educator, student ambassador, or website owner, anyone passionate about education can apply.',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background border-b border-border">
          <div className="max-w-7xl mx-auto px-4 md:px-6 text-center space-y-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-gradient-soft text-primary text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-4 w-4" /> Official NextUp Partner Network
            </span>

            <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
              Earn <span className="text-gradient">20% Commission</span> Empowering Students & Professionals.
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Join thousands of creators, mentors, and educators building a passive income stream with India&apos;s fastest-growing career learning platform.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <Button
                  onClick={() => setIsApplyOpen(true)}
                  size="lg"
                  className="bg-brand-gradient font-bold text-base px-8 h-13 shadow-premium hover:shadow-glow"
                >
                  Apply to Partner Network <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <Button asChild size="lg" className="bg-brand-gradient font-bold text-base px-8 h-13 shadow-premium">
                  <Link href="/login?redirect=/affiliate">Sign In to Apply <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
              )}

              <Button asChild size="lg" variant="outline" className="font-semibold text-base px-6 h-13">
                <Link href="/dashboard/affiliate">Go to Affiliate Dashboard</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Earnings Calculator Section */}
        <section className="py-16 md:py-24 bg-card border-b border-border">
          <div className="max-w-5xl mx-auto px-4 md:px-6 space-y-10">
            <div className="text-center space-y-3">
              <h2 className="font-display text-3xl font-bold">Interactive Earnings Calculator</h2>
              <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                Estimate how much passive income you can generate monthly with NextUp.
              </p>
            </div>

            <Card className="card-premium p-6 md:p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-semibold flex justify-between">
                      <span>Monthly Referrals:</span>
                      <span className="font-bold text-primary font-mono text-base">{referralCount} students</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={referralCount}
                      onChange={(e) => setReferralCount(Number(e.target.value))}
                      className="w-full mt-3 accent-primary"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold block mb-2">Target Package Tier:</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPackageChoice('pro')}
                        className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                          packageChoice === 'pro'
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground'
                        }`}
                      >
                        Pro Pass (₹999/mo)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPackageChoice('lifetime')}
                        className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                          packageChoice === 'lifetime'
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground'
                        }`}
                      >
                        Lifetime Pass (₹4,999)
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-primary/10 via-brand-gradient-soft to-transparent p-6 rounded-3xl border border-primary/20 text-center space-y-3">
                  <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Estimated Monthly Payout</p>
                  <p className="font-display text-4xl md:text-5xl font-extrabold text-primary">
                    ₹{monthlyEarnings.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-muted-foreground">Based on 20% partner commission rate</p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 md:px-6 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="font-display text-3xl font-bold">Why Partner with NextUp?</h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              We provide all the tools, assets, and tracking transparently so you can focus on building your audience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="card-premium p-6 space-y-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Zap className="h-6 w-6" />
              </span>
              <h3 className="font-bold text-lg">Instant Link & Code Generation</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Get your custom referral link and discount coupon codes in 1-click from your dashboard.
              </p>
            </Card>

            <Card className="card-premium p-6 space-y-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success">
                <Wallet className="h-6 w-6" />
              </span>
              <h3 className="font-bold text-lg">Direct Bank & UPI Payouts</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Receive weekly payouts directly into your bank account or UPI ID with complete transaction logs.
              </p>
            </Card>

            <Card className="card-premium p-6 space-y-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-500">
                <Clock className="h-6 w-6" />
              </span>
              <h3 className="font-bold text-lg">90-Day Cookie Attribution</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Never lose a conversion. Visitors stay linked to your profile for up to 90 days after clicking.
              </p>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-24 bg-card border-t border-border">
          <div className="max-w-3xl mx-auto px-4 md:px-6 space-y-8">
            <h2 className="font-display text-3xl font-bold text-center">Frequently Asked Questions</h2>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-border rounded-2xl overflow-hidden bg-background">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex justify-between items-center p-5 text-left font-semibold text-sm hover:bg-secondary/30 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {openFaq === i ? <ChevronUp className="h-4 w-4 shrink-0 text-primary" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
                  </button>
                  {openFaq === i && (
                    <div className="p-5 pt-0 text-xs text-muted-foreground leading-relaxed border-t border-border/50 bg-secondary/10">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Application Modal */}
      <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Apply for Partner Network</DialogTitle>
            <DialogDescription>Fill out your details to receive customized referral links and promotional assets.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-semibold">Website / Primary Social Channel</label>
              <Input
                placeholder="https://youtube.com/@mychannel or instagram.com/..."
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold">How will you promote NextUp? *</label>
              <Textarea
                placeholder="e.g. YouTube video reviews, Instagram reels, student WhatsApp groups..."
                value={promotionMethods}
                onChange={(e) => setPromotionMethods(e.target.value)}
                className="mt-1 text-xs min-h-[80px]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold">Estimated Monthly Reach</label>
              <Input
                placeholder="e.g. 5,000 monthly views"
                value={monthlyReach}
                onChange={(e) => setMonthlyReach(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApplyOpen(false)}>Cancel</Button>
            <Button onClick={handleApply} disabled={submitting} className="bg-brand-gradient font-semibold">
              {submitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
