'use client';

import Link from 'next/link';
import { Copy, ArrowRight, Gift, Users, IndianRupee } from 'lucide-react';
import { Navbar } from '@/components/site/navbar';
import { Footer } from '@/components/site/footer';
import { Reveal } from '@/components/site/reveal';
import { SectionHeading } from '@/components/site/section-heading';
import { StatCard } from '@/components/site/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { referralStats, referrals } from '@/lib/data/dashboard';

export default function AffiliatePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative overflow-hidden pt-32 md:pt-40 pb-16">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[700px] rounded-full bg-brand-gradient opacity-10 blur-[120px]" />
        </div>
        <div className="container">
          <Reveal>
            <div className="max-w-2xl mx-auto text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                Affiliate
              </span>
              <h1 className="mt-4 font-display text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
                Earn by <span className="text-gradient">sharing</span>
              </h1>
              <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
                Invite friends to NextUp and earn when they join. It&apos;s our way of saying
                thanks for spreading the word.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stats */}
      <section className="container pb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {referralStats.map((s, i) => (
            <StatCard key={s.label} {...s} delay={i * 80} />
          ))}
        </div>
      </section>

      {/* Referral link */}
      <section className="container pb-8">
        <Reveal>
          <Card className="card-premium">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Your referral link</p>
                  <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-4 py-3">
                    <span className="text-sm text-muted-foreground truncate">nextup.app/r/aarav-sharma</span>
                  </div>
                </div>
                <Button className="bg-brand-gradient font-semibold shrink-0">
                  <Copy className="mr-2 h-4 w-4" /> Copy link
                </Button>
              </div>
              <div className="mt-6 grid sm:grid-cols-3 gap-4">
                {[
                  { icon: Gift, title: 'Share your link', text: 'Send it to friends, post it, or embed it.' },
                  { icon: Users, title: 'They sign up', text: 'Friends get a special discount to join.' },
                  { icon: IndianRupee, title: 'You earn', text: 'Get up to ₹999 per paid referral.' },
                ].map((step) => (
                  <div key={step.title} className="rounded-2xl border border-border p-4">
                    <step.icon className="h-6 w-6 text-primary" />
                    <p className="mt-3 text-sm font-semibold">{step.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{step.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </section>

      {/* Referrals table */}
      <section className="container section-padding">
        <Reveal>
          <SectionHeading align="left" eyebrow="Your referrals" title="People you've invited" />
        </Reveal>
        <Reveal delay={100}>
          <Card className="card-premium mt-8 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-6 py-4 font-semibold">Friend</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold text-right">You earned</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((r) => (
                    <tr key={r.email} className="border-b border-border last:border-0 hover:bg-secondary/40 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-foreground">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={r.status === 'Joined' ? 'default' : 'secondary'}>{r.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{r.date}, 2026</td>
                      <td className="px-6 py-4 text-right font-semibold">{r.earned}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </Reveal>

        <div className="mt-10 text-center">
          <Button asChild variant="outline" className="font-semibold">
            <Link href="/dashboard/affiliate">Open affiliate dashboard <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
