'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/site/navbar';
import { Footer } from '@/components/site/footer';
import { Reveal } from '@/components/site/reveal';
import { SectionHeading } from '@/components/site/section-heading';
import { StatCard } from '@/components/site/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getIcon } from '@/lib/icons';
import { stats, values, team } from '@/lib/data/site';

const missionVision = [
  { icon: 'Target', title: 'Our Mission', text: 'To make premium, practical skill-building accessible to everyone — and to back it with a community that helps you finish what you start.' },
  { icon: 'Eye', title: 'Our Vision', text: 'A world where career growth is limited only by curiosity, not by access to quality education or a supportive network.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative overflow-hidden pt-32 md:pt-40 pb-16">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[700px] rounded-full bg-brand-gradient opacity-10 blur-[120px]" />
        </div>
        <div className="container">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                About
              </span>
              <h1 className="mt-4 font-display text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
                We help people <span className="text-gradient">build their future</span>
              </h1>
              <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
                NextUp was founded on a simple belief: everyone deserves access to premium,
                practical education that actually moves their career forward.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="container pb-8">
        <div className="grid md:grid-cols-2 gap-6">
          {missionVision.map((item, i) => {
            const Icon = getIcon(item.icon);
            return (
            <Reveal key={item.title} delay={i * 100}>
              <Card className="card-premium p-8 h-full">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-display text-2xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">{item.text}</p>
              </Card>
            </Reveal>
            );
          })}
        </div>
      </section>

      {/* Stats */}
      <section className="container section-padding">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((s, i) => (
            <StatCard key={s.label} {...s} delay={i * 80} />
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="container section-padding">
        <Reveal>
          <SectionHeading eyebrow="Our values" title="What we stand for" />
        </Reveal>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {values.map((v, i) => {
            const Icon = getIcon(v.icon);
            return (
            <Reveal key={v.title} delay={i * 80}>
              <Card className="card-premium card-premium-hover h-full p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient-soft text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">{v.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{v.text}</p>
              </Card>
            </Reveal>
            );
          })}
        </div>
      </section>

      {/* Team */}
      <section className="container section-padding">
        <Reveal>
          <SectionHeading eyebrow="Our team" title="The people behind NextUp" />
        </Reveal>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((m, i) => (
            <Reveal key={m.name} delay={i * 80}>
              <Card className="card-premium card-premium-hover p-6 text-center">
                <Avatar className="h-20 w-20 mx-auto">
                  <AvatarImage src={m.avatar} alt={m.name} />
                  <AvatarFallback className="bg-brand-gradient text-white font-semibold">
                    {m.name.split(' ').map((n) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <h3 className="mt-4 font-display text-lg font-semibold">{m.name}</h3>
                <p className="text-sm text-muted-foreground">{m.role}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-16 md:px-16 md:py-20 text-center">
            <div className="absolute inset-0 bg-brand-gradient opacity-20 blur-[80px]" />
            <div className="relative">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white">Join the NextUp family</h2>
              <p className="mt-4 text-slate-400 max-w-xl mx-auto">
                Become part of a community that&apos;s serious about learning and growth.
              </p>
              <Button asChild size="lg" className="mt-8 bg-brand-gradient shadow-glow font-semibold h-12 px-7">
                <Link href="/register">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
