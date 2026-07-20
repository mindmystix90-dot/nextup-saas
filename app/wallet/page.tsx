'use client';

import Link from 'next/link';
import { Wallet, ArrowDownLeft, ArrowUpRight, Plus, CreditCard, PiggyBank, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/site/navbar';
import { Footer } from '@/components/site/footer';
import { Reveal } from '@/components/site/reveal';
import { SectionHeading } from '@/components/site/section-heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { walletBalance, walletTransactions, paymentMethods } from '@/lib/data/dashboard';

export default function WalletPage() {
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
                Wallet
              </span>
              <h1 className="mt-4 font-display text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
                Your <span className="text-gradient">wallet</span>
              </h1>
              <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
                Manage your balance, transactions, and payouts in one place.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container section-padding">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Balance card */}
          <Reveal>
            <div className="lg:col-span-1">
              <Card className="card-premium overflow-hidden">
                <div className="bg-brand-gradient p-6 text-white">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                      <Wallet className="h-5 w-5" />
                    </span>
                    <CreditCard className="h-6 w-6 text-white/60" />
                  </div>
                  <p className="mt-6 text-sm text-white/80">Available balance</p>
                  <p className="mt-1 font-display text-4xl font-bold">{walletBalance}</p>
                  <p className="mt-2 text-xs text-white/70">Updated just now</p>
                </div>
                <CardContent className="p-5 space-y-3">
                  <Button className="w-full bg-brand-gradient font-semibold">
                    <Plus className="mr-2 h-4 w-4" /> Add funds
                  </Button>
                  <Button variant="outline" className="w-full font-semibold">
                    <PiggyBank className="mr-2 h-4 w-4" /> Withdraw
                  </Button>
                </CardContent>
              </Card>
            </div>
          </Reveal>

          {/* Transactions */}
          <Reveal delay={120} className="lg:col-span-2">
            <Card className="card-premium">
              <CardHeader className="flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg">Recent transactions</CardTitle>
                <Button variant="ghost" size="sm">View all</Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {walletTransactions.map((t) => (
                  <div key={t.label} className="flex items-center gap-4 rounded-xl border border-border p-3.5 hover:bg-secondary/40 transition-colors">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${t.type === 'in' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                      {t.type === 'in' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{t.label}</p>
                      <p className="text-xs text-muted-foreground">{t.date}</p>
                    </div>
                    <span className={`text-sm font-semibold ${t.type === 'in' ? 'text-success' : 'text-foreground'}`}>{t.amount}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </Reveal>
        </div>

        {/* Payment methods */}
        <Reveal delay={150}>
          <Card className="card-premium mt-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Payment methods</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              {paymentMethods.map((m) => (
                <div key={m.last4} className="flex items-center gap-4 rounded-2xl border border-border p-4">
                  <span className="flex h-10 w-14 items-center justify-center rounded-lg bg-slate-950 text-white text-[10px] font-bold">
                    {m.brand}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">•••• {m.last4}</p>
                    <p className="text-xs text-muted-foreground">Expires {m.exp}</p>
                  </div>
                  <Badge variant="secondary">Default</Badge>
                </div>
              ))}
              <button className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border p-4 text-sm font-medium text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors">
                <Plus className="h-4 w-4" /> Add payment method
              </button>
            </CardContent>
          </Card>
        </Reveal>

        <div className="mt-10 text-center">
          <Button asChild variant="outline" className="font-semibold">
            <Link href="/dashboard/wallet">Open wallet in dashboard <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
