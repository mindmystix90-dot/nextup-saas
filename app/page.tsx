'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/site/navbar';
import { Footer } from '@/components/site/footer';
import { Reveal } from '@/components/site/reveal';
import { SectionHeading } from '@/components/site/section-heading';
import { StatCard } from '@/components/site/stat-card';
import { CategoryCard } from '@/components/site/category-card';
import { PricingCard } from '@/components/site/pricing-card';
import { TestimonialCard } from '@/components/site/testimonial-card';
import { HeroIllustration } from '@/components/site/hero-illustration';
import { CertificateIllustration } from '@/components/site/certificate-illustration';
import { CommunityIllustration } from '@/components/site/community-illustration';
import { getIcon } from '@/lib/icons';
import { useCmsContent } from '@/hooks/use-cms';
import {
  hero as fallbackHero,
  stats as fallbackStats,
  categories,
  journey,
  certificateFeatures,
  communityFeatures,
  opportunities,
  pricing,
  testimonials,
} from '@/lib/data/site';

const HERO_AVATARS = [
  'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
  'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
  'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
];

export default function HomePage() {
  const { hero: cmsHero, stats: cmsStats } = useCmsContent();
  const hero = {
    eyebrow: cmsHero.eyebrow || fallbackHero.eyebrow,
    title: [cmsHero.titleLine1, cmsHero.titleLine2, cmsHero.titleLine3].filter(Boolean) as string[],
    subtitle: cmsHero.subtitle || fallbackHero.subtitle,
    primaryCta: { label: cmsHero.primaryCta || fallbackHero.primaryCta.label, href: fallbackHero.primaryCta.href },
    secondaryCta: { label: cmsHero.secondaryCta || fallbackHero.secondaryCta.label, href: fallbackHero.secondaryCta.href },
    socialProof: fallbackHero.socialProof,
  };
  const stats = cmsStats.length > 0
    ? cmsStats.map((s) => ({ value: Number(s.value) || 0, suffix: s.suffix, label: s.label, icon: s.icon }))
    : fallbackStats;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden pt-32 md:pt-40 pb-20 md:pb-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-brand-gradient opacity-10 blur-[120px]" />
          <div className="absolute top-20 right-10 h-72 w-72 rounded-full bg-accent/20 blur-[80px]" />
        </div>
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <div className="text-center lg:text-left">
              <Reveal>
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  {hero.eyebrow}
                </span>
              </Reveal>
              <Reveal delay={100}>
                <h1 className="mt-6 font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.05]">
                  {hero.title[0]}
                  <br />
                  {hero.title[1]}
                  <br />
                  <span className="text-gradient">{hero.title[2]}</span>
                </h1>
              </Reveal>
              <Reveal delay={200}>
                <p className="mt-6 text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
                  {hero.subtitle}
                </p>
              </Reveal>
              <Reveal delay={300}>
                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Button asChild size="lg" className="bg-brand-gradient shadow-glow font-semibold h-12 px-7 text-base">
                    <Link href={hero.primaryCta.href}>
                      {hero.primaryCta.label} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="h-12 px-7 text-base font-semibold">
                    <Link href={hero.secondaryCta.href}>{hero.secondaryCta.label}</Link>
                  </Button>
                </div>
              </Reveal>
              <Reveal delay={400}>
                <div className="mt-8 flex items-center gap-5 justify-center lg:justify-start">
                  <div className="flex -space-x-2.5">
                    {HERO_AVATARS.map((src) => (
                      <img key={src} src={src} alt="student" className="h-9 w-9 rounded-full border-2 border-background object-cover" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">25,000+</span> {hero.socialProof.replace('25,000+ ', '')}
                  </p>
                </div>
              </Reveal>
            </div>
            <Reveal delay={200} className="lg:pl-8">
              <HeroIllustration />
            </Reveal>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="container section-padding">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((s, i) => (
            <StatCard key={s.label} {...s} delay={i * 80} />
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container section-padding">
        <Reveal>
          <SectionHeading
            eyebrow="Explore"
            title={<>Find your <span className="text-gradient">path</span></>}
            description="Eight curated categories covering the most in-demand skills for the modern workforce."
          />
        </Reveal>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {categories.map((c, i) => (
            <Reveal key={c.name} delay={i * 60}>
              <CategoryCard {...c} delay={i * 60} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* LEARNING JOURNEY */}
      <section className="relative section-padding overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-brand-gradient-soft" />
        <div className="container">
          <Reveal>
            <SectionHeading
              eyebrow="How it works"
              title={<>Your learning <span className="text-gradient">journey</span></>}
              description="A clear, guided path from your first lesson to real career growth."
            />
          </Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-5">
            {journey.map((step, i) => {
              const Icon = getIcon(step.icon);
              return (
                <Reveal key={step.step} delay={i * 120} className="relative">
                  <div className="card-premium p-6 h-full">
                    <div className="flex items-center justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="font-display text-2xl font-bold text-primary/15">{step.step}</span>
                    </div>
                    <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                  {i < journey.length - 1 && (
                    <div className="hidden md:flex absolute top-1/2 -right-3 z-10 h-6 w-6 -translate-y-1/2 items-center justify-center">
                      <ArrowRight className="h-4 w-4 text-primary/40" />
                    </div>
                  )}
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* CERTIFICATE */}
      <section className="container section-padding">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <Reveal>
            <CertificateIllustration />
          </Reveal>
          <Reveal delay={150}>
            <div>
              <SectionHeading
                align="left"
                eyebrow="Certificates"
                title={<>Earn certificates that <span className="text-gradient">mean something</span></>}
                description="Every certificate is verifiable, shareable, and built to be recognized by employers."
              />
              <ul className="mt-8 space-y-5">
                {certificateFeatures.map((item) => {
                  const Icon = getIcon(item.icon);
                  return (
                    <li key={item.title} className="flex items-start gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient-soft text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-semibold text-foreground">{item.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">{item.text}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <Button asChild size="lg" className="mt-8 bg-brand-gradient shadow-glow font-semibold h-12 px-7">
                <Link href="/courses">Browse courses <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* COMMUNITY */}
      <section className="relative section-padding overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-slate-950" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/15 via-transparent to-transparent" />
        <div className="absolute -top-20 left-1/3 h-72 w-72 rounded-full bg-accent/20 blur-[100px] pointer-events-none" />
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <Reveal className="order-2 lg:order-1">
              <div>
                <SectionHeading
                  align="left"
                  eyebrow="Community"
                  title={<span className="text-white">You don&apos;t learn alone</span>}
                  description={<span className="text-slate-400">Join thousands of learners, attend live classes, and grow with people on the same journey.</span>}
                />
                <div className="mt-8 grid sm:grid-cols-3 gap-4">
                  {communityFeatures.map((item) => {
                    const Icon = getIcon(item.icon);
                    return (
                      <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                        <Icon className="h-6 w-6 text-primary" />
                        <p className="mt-3 text-sm font-semibold text-white">{item.title}</p>
                        <p className="mt-1 text-xs text-slate-400">{item.text}</p>
                      </div>
                    );
                  })}
                </div>
                <Button asChild size="lg" className="mt-8 bg-brand-gradient shadow-glow font-semibold h-12 px-7">
                  <Link href="/community">Join the community <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </Reveal>
            <Reveal delay={150} className="order-1 lg:order-2">
              <CommunityIllustration />
            </Reveal>
          </div>
        </div>
      </section>

      {/* OPPORTUNITIES */}
      <section className="container section-padding">
        <Reveal>
          <SectionHeading
            eyebrow="Beyond learning"
            title={<>Unlock <span className="text-gradient">opportunities</span></>}
            description="As you grow with NextUp, doors open. We help you turn skills into real career momentum."
          />
        </Reveal>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {opportunities.map((item, i) => {
            const Icon = getIcon(item.icon);
            return (
              <Reveal key={item.title} delay={i * 120}>
                <div className="card-premium card-premium-hover p-7 h-full">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} text-white shadow-md`}>
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                  <p className="mt-4 text-xs font-medium text-primary">Unlocked with Pro membership</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* PRICING */}
      <section className="relative section-padding overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-brand-gradient-soft" />
        <div className="container">
          <Reveal>
            <SectionHeading
              eyebrow="Pricing"
              title={<>Simple, <span className="text-gradient">honest</span> pricing</>}
              description="Start free. Upgrade when you're ready. Cancel anytime."
            />
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

      {/* TESTIMONIALS */}
      <section className="container section-padding">
        <Reveal>
          <SectionHeading
            eyebrow="Loved by learners"
            title={<>Don&apos;t take our <span className="text-gradient">word</span> for it</>}
            description="Thousands of learners have grown with NextUp. Here's what a few of them have to say."
          />
        </Reveal>
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={(i % 3) * 100}>
              <TestimonialCard {...t} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-16 md:px-16 md:py-20 text-center">
            <div className="absolute inset-0 bg-brand-gradient opacity-20 blur-[80px]" />
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-60 w-[500px] rounded-full bg-primary/30 blur-[100px]" />
            <div className="relative">
              <h2 className="font-display text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                Ready to build your future?
              </h2>
              <p className="mt-4 text-base md:text-lg text-slate-400 max-w-xl mx-auto">
                Join 25,000+ learners who are leveling up their skills and careers with NextUp.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="bg-brand-gradient shadow-glow font-semibold h-12 px-7 text-base">
                  <Link href="/register">Get Started Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 px-7 text-base font-semibold bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white">
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
