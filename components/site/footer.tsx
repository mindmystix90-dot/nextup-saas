'use client';

import Link from 'next/link';
import { GraduationCap, Twitter, Linkedin, Youtube, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { footerSections, siteConfig } from '@/lib/data/site';
import { useCmsContent } from '@/hooks/use-cms';

const SOCIALS = [
  { icon: Twitter, href: siteConfig.social.twitter, label: 'Twitter' },
  { icon: Linkedin, href: siteConfig.social.linkedin, label: 'LinkedIn' },
  { icon: Youtube, href: siteConfig.social.youtube, label: 'YouTube' },
  { icon: Instagram, href: siteConfig.social.instagram, label: 'Instagram' },
];

export function Footer() {
  const { footer, company } = useCmsContent();

  return (
    <footer className="relative bg-slate-950 text-slate-300 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-80 w-[600px] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="container relative py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient">
                <GraduationCap className="h-5 w-5 text-white" />
              </span>
              <span className="font-display text-xl font-bold text-white">{company.name || siteConfig.name}</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              {footer.description}
            </p>
            <div className="mt-4 space-y-2 text-xs text-slate-400">
              <a href={`mailto:${footer.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="h-3.5 w-3.5" /> {footer.email}
              </a>
              <a href={`tel:${footer.phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="h-3.5 w-3.5" /> {footer.phone}
              </a>
              <p className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" /> {footer.address}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-3">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-300 transition-all hover:bg-brand-gradient hover:border-transparent hover:text-white hover:-translate-y-0.5"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-white">{section.title}</h4>
              <ul className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} {company.name || siteConfig.name}. All rights reserved.
          </p>
          {company.gstin && (
            <p className="text-xs text-slate-600">GSTIN: {company.gstin}</p>
          )}
        </div>
      </div>
    </footer>
  );
}
