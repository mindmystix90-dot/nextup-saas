'use client';

import { useState } from 'react';
import { LifeBuoy, BookOpen, MessageSquare, Mail, Clock, Send, Plus, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { supportFaqs } from '@/lib/data/site';
import { helpArticles, supportTickets, supportChannels } from '@/lib/data/support';
import { getIcon } from '@/lib/icons';
import { toast } from 'sonner';

const PRIORITY_STYLES: Record<string, string> = {
  Low: 'bg-secondary text-muted-foreground',
  Medium: 'bg-warning/10 text-warning',
  High: 'bg-destructive/10 text-destructive',
};

const STATUS_STYLES: Record<string, string> = {
  Open: 'bg-primary/10 text-primary',
  'Awaiting Reply': 'bg-warning/10 text-warning',
  Resolved: 'bg-success/10 text-success',
};

export default function DashboardSupportPage() {
  const [sent, setSent] = useState(false);
  const [query, setQuery] = useState('');

  const filteredArticles = helpArticles.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient-soft text-primary">
            <LifeBuoy className="h-5 w-5" />
          </span>
          Support
        </h1>
        <p className="mt-2 text-muted-foreground">Get help, browse FAQs, and contact our team.</p>
      </div>

      {/* Channels */}
      <div className="grid sm:grid-cols-3 gap-5 mb-8">
        {supportChannels.map((c) => {
          const Icon = getIcon(c.icon);
          return (
            <Link key={c.title} href={c.href}>
              <Card className="card-premium card-premium-hover h-full p-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient-soft text-primary">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">{c.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.text}</p>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Help articles */}
          <Card className="card-premium">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" /> Help articles
              </CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              {filteredArticles.map((a) => {
                const Icon = getIcon(a.icon);
                return (
                  <div key={a.title} className="rounded-2xl border border-border p-4 hover:border-primary/30 hover:shadow-premium transition-all cursor-pointer">
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-gradient-soft text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold leading-tight">{a.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{a.excerpt}</p>
                        <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                          <Badge variant="secondary" className="text-[10px]">{a.category}</Badge>
                          <span>· {a.readTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="text-lg">Common questions</CardTitle>
              <CardDescription>Quick answers to the things learners ask most.</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Contact form */}
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" /> Contact support
              </CardTitle>
              <CardDescription>We typically reply within 2 hours.</CardDescription>
            </CardHeader>
            <CardContent>
              {sent ? (
                <div className="flex flex-col items-center text-center py-6">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success">
                    <Send className="h-6 w-6" />
                  </span>
                  <p className="mt-4 font-semibold">Message sent!</p>
                  <p className="mt-1 text-sm text-muted-foreground">We&apos;ll get back to you shortly.</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => setSent(false)}>Send another</Button>
                </div>
              ) : (
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSent(true);
                    toast.success('Message sent! We will reply within 2 hours.');
                  }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="How can we help?" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" rows={4} placeholder="Tell us a bit more…" required />
                  </div>
                  <Button type="submit" className="w-full bg-brand-gradient font-semibold">
                    Send message <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Tickets */}
          <Card className="card-premium">
            <CardHeader className="flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg">Your tickets</CardTitle>
              <Button size="sm" variant="outline" className="font-semibold" onClick={() => toast.message('Opening new ticket form…')}>
                <Plus className="mr-1.5 h-4 w-4" /> New
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {supportTickets.map((t) => (
                <div key={t.id} className="rounded-2xl border border-border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-[11px] text-muted-foreground">{t.id}</p>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_STYLES[t.priority]}`}>
                      {t.priority}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold">{t.subject}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[t.status]}`}>
                      {t.status}
                    </span>
                    <span className="text-xs text-muted-foreground">Updated {t.updated}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="card-premium p-6 text-center">
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
              <Clock className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-display text-base font-semibold">Still need help?</h3>
            <p className="mt-1 text-xs text-muted-foreground">Our team is here for you. Reach out anytime.</p>
            <Button asChild size="sm" className="mt-4 bg-brand-gradient font-semibold">
              <Link href="/contact">Contact us <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
            </Button>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
