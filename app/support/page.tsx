'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, BookOpen, MessageSquare, Mail, Clock, ArrowRight, Send } from 'lucide-react';
import { Navbar } from '@/components/site/navbar';
import { Footer } from '@/components/site/footer';
import { Reveal } from '@/components/site/reveal';
import { SectionHeading } from '@/components/site/section-heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { supportFaqs } from '@/lib/data/site';
import { helpArticles, supportChannels } from '@/lib/data/support';
import { getIcon } from '@/lib/icons';
import { toast } from 'sonner';

export default function SupportPage() {
  const [query, setQuery] = useState('');
  const [sent, setSent] = useState(false);

  const filteredArticles = helpArticles.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase())
  );

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
                Support
              </span>
              <h1 className="mt-4 font-display text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
                How can we <span className="text-gradient">help?</span>
              </h1>
              <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
                Search our help center or reach out — we typically reply within 2 hours.
              </p>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="mt-8 max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for help articles…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-12 pl-12 text-base"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Channels */}
      <section className="container pb-8">
        <div className="grid sm:grid-cols-3 gap-5">
          {supportChannels.map((c, i) => {
            const Icon = getIcon(c.icon);
            return (
              <Reveal key={c.title} delay={i * 80}>
                <Link href={c.href}>
                  <Card className="card-premium card-premium-hover h-full p-6">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient-soft text-primary">
                      <Icon className="h-6 w-6" />
                    </span>
                    <h3 className="mt-4 font-display text-lg font-semibold">{c.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{c.text}</p>
                  </Card>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Help articles */}
      <section className="container pb-8">
        <Reveal>
          <SectionHeading eyebrow="Help articles" title="Browse our guides" />
        </Reveal>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredArticles.map((a, i) => {
            const Icon = getIcon(a.icon);
            return (
              <Reveal key={a.title} delay={(i % 3) * 80}>
                <Card className="card-premium card-premium-hover h-full p-6">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient-soft text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="flex-1">
                      <Badge variant="secondary" className="text-[10px]">{a.category}</Badge>
                      <h3 className="mt-2 font-display text-base font-semibold leading-tight">{a.title}</h3>
                      <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{a.excerpt}</p>
                      <p className="mt-3 text-[11px] text-muted-foreground">{a.readTime}</p>
                    </div>
                  </div>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* FAQ + Contact form */}
      <section className="container pb-24">
        <div className="grid lg:grid-cols-2 gap-8">
          <Reveal>
            <div>
              <SectionHeading align="left" eyebrow="FAQ" title="Common questions" />
              <div className="mt-8">
                <Accordion type="single" collapsible className="space-y-3">
                  {supportFaqs.map((item, i) => (
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
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <Card className="card-premium p-6 md:p-8">
              {sent ? (
                <div className="flex flex-col items-center text-center py-10">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10 text-success">
                    <Send className="h-7 w-7" />
                  </span>
                  <h2 className="mt-5 font-display text-xl font-semibold">Message sent!</h2>
                  <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                    Thanks for reaching out. We&apos;ll get back to you within 2 hours.
                  </p>
                  <Button className="mt-6" variant="outline" onClick={() => setSent(false)}>
                    Send another
                  </Button>
                </div>
              ) : (
                <form
                  className="space-y-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSent(true);
                    toast.success('Message sent! We will reply within 2 hours.');
                  }}
                >
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="Your name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="you@example.com" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="How can we help?" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" rows={5} placeholder="Tell us a bit more…" required />
                  </div>
                  <Button type="submit" className="w-full bg-brand-gradient shadow-glow font-semibold h-11">
                    Send message <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              )}
            </Card>
          </Reveal>
        </div>

        <Reveal>
          <Card className="card-premium max-w-2xl mx-auto mt-12 text-center p-8">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
              <Clock className="h-6 w-6" />
            </span>
            <h3 className="mt-4 font-display text-xl font-semibold">Still need help?</h3>
            <p className="mt-2 text-sm text-muted-foreground">Our team is here for you. Reach out and we&apos;ll get you sorted.</p>
            <Button asChild className="mt-5 bg-brand-gradient font-semibold">
              <Link href="/contact">Contact support <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </Card>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
