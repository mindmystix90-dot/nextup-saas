import Link from 'next/link';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import { Navbar } from '@/components/site/navbar';
import { Footer } from '@/components/site/footer';
import { Reveal } from '@/components/site/reveal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function PublicPlaceholder({
  eyebrow,
  title,
  description,
  icon: Icon,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  icon: LucideIcon;
  children?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative overflow-hidden pt-32 md:pt-40 pb-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[700px] rounded-full bg-brand-gradient opacity-10 blur-[120px]" />
        </div>
        <div className="container">
          <Reveal>
            <div className="max-w-2xl mx-auto text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                {eyebrow}
              </span>
              <h1 className="mt-4 font-display text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
                {title}
              </h1>
              <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          </Reveal>

          {children ?? (
            <Reveal delay={150}>
              <Card className="card-premium max-w-2xl mx-auto mt-14">
                <CardContent className="p-12 text-center">
                  <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient-soft text-primary">
                    <Icon className="h-8 w-8" />
                  </span>
                  <h2 className="mt-5 font-display text-xl font-semibold">This page is part of the prototype</h2>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                    Full content and functionality will be connected here in a future update.
                  </p>
                  <Button asChild className="mt-6 bg-brand-gradient font-semibold">
                    <Link href="/">Back to home <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </CardContent>
              </Card>
            </Reveal>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
