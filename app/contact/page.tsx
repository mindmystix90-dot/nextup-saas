'use client';

import { useState } from 'react';
import { Mail, MessageSquare, MapPin, Phone, ArrowRight, Send } from 'lucide-react';
import { Navbar } from '@/components/site/navbar';
import { Footer } from '@/components/site/footer';
import { Reveal } from '@/components/site/reveal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { siteConfig } from '@/lib/data/site';

const CHANNELS = [
  { icon: Mail, title: 'Email', value: siteConfig.email, text: 'We reply within 24 hours.' },
  { icon: MessageSquare, title: 'Live Chat', value: 'Available 9am–6pm', text: 'Mon–Fri, in your dashboard.' },
  { icon: Phone, title: 'Phone', value: siteConfig.phone, text: 'For urgent account issues.' },
  { icon: MapPin, title: 'Office', value: siteConfig.address, text: 'Drop by for a coffee.' },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);

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
                Contact
              </span>
              <h1 className="mt-4 font-display text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
                Let&apos;s <span className="text-gradient">talk</span>
              </h1>
              <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
                Questions, feedback, or just want to say hi? We&apos;d love to hear from you.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container pb-24">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8">
          {/* Form */}
          <Reveal>
            <Card className="card-premium p-6 md:p-8">
              {sent ? (
                <div className="flex flex-col items-center text-center py-10">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10 text-success">
                    <Send className="h-7 w-7" />
                  </span>
                  <h2 className="mt-5 font-display text-xl font-semibold">Message sent!</h2>
                  <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                    Thanks for reaching out. We&apos;ll get back to you within 24 hours.
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
                    toast.success('Message sent! We will reply within 24 hours.');
                  }}
                >
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="you@example.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="How can we help?" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" rows={5} placeholder="Tell us a bit more…" />
                  </div>
                  <Button type="submit" className="w-full bg-brand-gradient shadow-glow font-semibold h-11">
                    Send message <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              )}
            </Card>
          </Reveal>

          {/* Channels */}
          <div className="space-y-4">
            {CHANNELS.map((c, i) => (
              <Reveal key={c.title} delay={i * 80}>
                <Card className="card-premium card-premium-hover">
                  <CardContent className="p-5 flex items-center gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient-soft text-primary">
                      <c.icon className="h-6 w-6" />
                    </span>
                    <div>
                      <p className="text-xs text-muted-foreground">{c.title}</p>
                      <p className="font-semibold text-foreground">{c.value}</p>
                      <p className="text-xs text-muted-foreground">{c.text}</p>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
