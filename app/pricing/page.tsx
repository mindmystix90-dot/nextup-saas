'use client';

import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/site/navbar';
import { Footer } from '@/components/site/footer';
import { Reveal } from '@/components/site/reveal';
import { SectionHeading } from '@/components/site/section-heading';
import { PricingCard } from '@/components/site/pricing-card';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { pricing, faqs } from '@/lib/data/site';

const FEATURE_STRIP = [
  'Expert-led courses',
  'Verifiable certificates',
  'Weekly live classes',
  'Active community',
  'Progress analytics',
  'Mobile-friendly',
  'Priority support',
  'Lifetime updates',
];

export default function PricingPage() {
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
                Pricing
              </span>
              <h1 className="mt-4 font-display text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
                Simple, <span className="text-gradient">honest</span> pricing
              </h1>
              <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
                Start free. Upgrade when you&apos;re ready. Cancel anytime.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {pricing.plans.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 100}>
                <PricingCard {...plan} />
              </Reveal>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {pricing.guarantee}
          </p>
        </div>
      </section>

      {/* Comparison / features strip */}
      <section className="container section-padding">
        <Reveal>
          <SectionHeading
            eyebrow="Why NextUp"
            title={<>More than just <span className="text-gradient">courses</span></>}
            description="Every plan includes access to the features that make learning stick."
          />
        </Reveal>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURE_STRIP.map((f, i) => (
            <Reveal key={f} delay={i * 50}>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                  <Check className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium">{f}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="container pb-24">
        <Reveal>
          <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
        </Reveal>
        <div className="mt-10 max-w-3xl mx-auto">
          <Reveal>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="rounded-2xl border border-border bg-card px-5">
                  <AccordionTrigger className="text-left font-semibold hover:no-underline">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">Still have questions?</p>
          <Button asChild variant="outline" className="mt-3 font-semibold">
            <Link href="/contact">Contact us <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
