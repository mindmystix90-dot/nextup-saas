'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/site/navbar';
import { Footer } from '@/components/site/footer';
import { fetchActivePricingPlans } from '@/services/pricing.service';
import { CheckoutModal } from '@/components/checkout/checkout-modal';
import { useAuth } from '@/hooks/use-auth';
import type { PricingPlan } from '@/types';

export default function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const p = await fetchActivePricingPlans();
        setPlans(p);
      } catch { /* best-effort */ } finally { setLoading(false); }
    })();
  }, []);

  const handleSelectPlan = (plan: PricingPlan) => {
    if (!user) {
      router.push(`/register?redirect=/pricing`);
    } else {
      setSelectedPlan(plan);
      setIsCheckoutOpen(true);
    }
  };

  return (
    <>
      <Navbar />
      <section className="relative pt-20 pb-16">
        <div className="absolute inset-0 bg-brand-gradient opacity-[0.03] pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge className="bg-brand-gradient-soft text-primary border-transparent mb-4">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Pricing
            </Badge>
            <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
              Simple, transparent pricing
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Choose the plan that fits your journey. Instant package access upon purchase.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : plans.length === 0 ? (
            <div className="mx-auto max-w-md text-center py-16">
              <p className="text-muted-foreground">No pricing plans available yet. Please check back soon.</p>
              <Button asChild className="mt-4 bg-brand-gradient font-semibold">
                <Link href="/register">Create an account</Link>
              </Button>
            </div>
          ) : (
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`card-premium card-premium-hover relative overflow-hidden ${plan.featured ? 'border-primary shadow-premium-lg' : ''}`}
                >
                  {plan.badge && (
                    <div className="absolute top-0 right-0 bg-brand-gradient px-3 py-1 text-xs font-semibold text-white rounded-bl-xl">
                      {plan.badge}
                    </div>
                  )}
                  <CardContent className="p-6">
                    <h3 className="font-display text-xl font-bold">{plan.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="font-display text-4xl font-bold">₹{plan.price.toLocaleString('en-IN')}</span>
                      <span className="text-sm text-muted-foreground">{plan.period}</span>
                    </div>
                    <Button
                      onClick={() => handleSelectPlan(plan)}
                      className={`mt-6 w-full font-semibold ${plan.featured ? 'bg-brand-gradient' : ''}`}
                      variant={plan.featured ? 'default' : 'outline'}
                    >
                      {plan.cta}
                    </Button>
                    <ul className="mt-6 space-y-3">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                          <span className="text-foreground">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <p className="mt-8 text-center text-sm text-muted-foreground">
            All plans include a 7-day money-back guarantee. Instant package access upon payment.
          </p>
        </div>
      </section>

      {/* Checkout Modal */}
      {selectedPlan && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          item={{
            id: selectedPlan.id,
            name: `${selectedPlan.name} Membership`,
            description: selectedPlan.description,
            price: selectedPlan.price,
            type: 'membership',
          }}
        />
      )}

      <Footer />
    </>
  );
}

