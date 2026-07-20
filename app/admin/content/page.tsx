'use client';

import { useEffect, useState } from 'react';
import { FileText, Save, Loader2, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AdminPageHeader, StatusBadge } from '@/components/admin/admin-page-header';
import { toast } from 'sonner';
import { fetchCmsContent, updateCmsSection, defaultCmsContent, type CmsContent, type CmsSection } from '@/services/cms.service';

export default function AdminContentPage() {
  const [content, setContent] = useState<CmsContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [savingAll, setSavingAll] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchCmsContent();
        if (!cancelled) {
          setContent(data ?? defaultCmsContent());
        }
      } catch {
        if (!cancelled) {
          setContent(defaultCmsContent());
          toast.error('Using fallback content — database unavailable');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function saveSection(section: CmsSection, value: unknown) {
    setSavingSection(section);
    try {
      await updateCmsSection(section, value);
      toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} saved`);
    } catch {
      toast.error(`Failed to save ${section}`);
    } finally {
      setSavingSection(null);
    }
  }

  async function saveAll() {
    if (!content) return;
    setSavingAll(true);
    try {
      for (const section of ['hero', 'stats', 'footer', 'contact', 'company'] as CmsSection[]) {
        await updateCmsSection(section, (content as unknown as Record<string, unknown>)[section]);
      }
      toast.success('All changes saved and published');
    } catch {
      toast.error('Failed to save some sections');
    } finally {
      setSavingAll(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const fallback = defaultCmsContent();
  const hero = content?.hero || fallback.hero;
  const stats = content?.stats || fallback.stats;
  const footer = content?.footer || fallback.footer;
  const contact = content?.contact || fallback.contact;
  const company = content?.company || fallback.company;

  const [heroForm, setHeroForm] = useState(hero);
  const [statsForm, setStatsForm] = useState(stats);
  const [footerForm, setFooterForm] = useState(footer);
  const [contactForm, setContactForm] = useState(contact);
  const [companyForm, setCompanyForm] = useState(company);

  // Reset forms when content loads
  useEffect(() => {
    setHeroForm(hero);
    setStatsForm(stats);
    setFooterForm(footer);
    setContactForm(contact);
    setCompanyForm(company);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content?.updatedAt]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={FileText}
        title="Website content"
        subtitle="Edit the public-facing marketing copy, contact details and company information."
        actions={
          <Button size="sm" className="bg-brand-gradient font-semibold" onClick={saveAll} disabled={savingAll}>
            {savingAll ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            Save all
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Hero */}
        <Card className="card-premium">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">Hero section</CardTitle>
            <Button
              variant="outline"
              size="sm"
              disabled={savingSection === 'hero'}
              onClick={() => saveSection('hero', heroForm)}
            >
              {savingSection === 'hero' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
              Save
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="hero-eyebrow">Eyebrow</Label>
              <Input id="hero-eyebrow" value={heroForm.eyebrow} onChange={(e) => setHeroForm((f) => ({ ...f, eyebrow: e.target.value }))} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="hero-l1">Title line 1</Label>
                <Input id="hero-l1" value={heroForm.titleLine1} onChange={(e) => setHeroForm((f) => ({ ...f, titleLine1: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hero-l2">Title line 2</Label>
                <Input id="hero-l2" value={heroForm.titleLine2} onChange={(e) => setHeroForm((f) => ({ ...f, titleLine2: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hero-l3">Title line 3</Label>
                <Input id="hero-l3" value={heroForm.titleLine3} onChange={(e) => setHeroForm((f) => ({ ...f, titleLine3: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hero-sub">Subtitle</Label>
              <Textarea id="hero-sub" rows={3} value={heroForm.subtitle} onChange={(e) => setHeroForm((f) => ({ ...f, subtitle: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="hero-cta1">Primary CTA</Label>
                <Input id="hero-cta1" value={heroForm.primaryCta} onChange={(e) => setHeroForm((f) => ({ ...f, primaryCta: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hero-cta2">Secondary CTA</Label>
                <Input id="hero-cta2" value={heroForm.secondaryCta} onChange={(e) => setHeroForm((f) => ({ ...f, secondaryCta: e.target.value }))} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="card-premium">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">Statistics</CardTitle>
            <Button
              variant="outline"
              size="sm"
              disabled={savingSection === 'stats'}
              onClick={() => saveSection('stats', statsForm)}
            >
              {savingSection === 'stats' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
              Save
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {statsForm.map((s, i) => (
              <div key={i} className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-4 space-y-1.5">
                  <Label>Label</Label>
                  <Input value={s.label} onChange={(e) => setStatsForm((arr) => arr.map((x, idx) => idx === i ? { ...x, label: e.target.value } : x))} />
                </div>
                <div className="col-span-3 space-y-1.5">
                  <Label>Value</Label>
                  <Input value={s.value} onChange={(e) => setStatsForm((arr) => arr.map((x, idx) => idx === i ? { ...x, value: e.target.value } : x))} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Suffix</Label>
                  <Input value={s.suffix} onChange={(e) => setStatsForm((arr) => arr.map((x, idx) => idx === i ? { ...x, suffix: e.target.value } : x))} />
                </div>
                <div className="col-span-3 space-y-1.5">
                  <Label>Icon</Label>
                  <Input value={s.icon} onChange={(e) => setStatsForm((arr) => arr.map((x, idx) => idx === i ? { ...x, icon: e.target.value } : x))} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="card-premium">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">Contact</CardTitle>
            <Button
              variant="outline"
              size="sm"
              disabled={savingSection === 'contact'}
              onClick={() => saveSection('contact', contactForm)}
            >
              {savingSection === 'contact' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
              Save
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="contact-email">Email</Label>
                <Input id="contact-email" value={contactForm.email} onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-phone">Phone</Label>
                <Input id="contact-phone" value={contactForm.phone} onChange={(e) => setContactForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-address">Address</Label>
              <Textarea id="contact-address" rows={2} value={contactForm.address} onChange={(e) => setContactForm((f) => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-hours">Hours</Label>
              <Input id="contact-hours" value={contactForm.hours} onChange={(e) => setContactForm((f) => ({ ...f, hours: e.target.value }))} />
            </div>
          </CardContent>
        </Card>

        {/* Footer & company */}
        <Card className="card-premium">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">Footer & company</CardTitle>
            <Button
              variant="outline"
              size="sm"
              disabled={savingSection === 'footer'}
              onClick={() => { saveSection('footer', footerForm); saveSection('company', companyForm); }}
            >
              {savingSection === 'footer' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
              Save
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="footer-desc">Footer description</Label>
              <Textarea id="footer-desc" rows={3} value={footerForm.description} onChange={(e) => setFooterForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="footer-email">Footer email</Label>
                <Input id="footer-email" value={footerForm.email} onChange={(e) => setFooterForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="footer-phone">Footer phone</Label>
                <Input id="footer-phone" value={footerForm.phone} onChange={(e) => setFooterForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="co-name">Company name</Label>
                <Input id="co-name" value={companyForm.name} onChange={(e) => setCompanyForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="co-tag">Tagline</Label>
                <Input id="co-tag" value={companyForm.tagline} onChange={(e) => setCompanyForm((f) => ({ ...f, tagline: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="co-founded">Founded</Label>
                <Input id="co-founded" value={companyForm.founded} onChange={(e) => setCompanyForm((f) => ({ ...f, founded: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="co-gstin">GSTIN</Label>
                <Input id="co-gstin" value={companyForm.gstin} onChange={(e) => setCompanyForm((f) => ({ ...f, gstin: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="co-legal">Legal name</Label>
              <Input id="co-legal" value={companyForm.legalName} onChange={(e) => setCompanyForm((f) => ({ ...f, legalName: e.target.value }))} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="text-lg">Publish status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Hero:</span> <StatusBadge status="Published" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Footer:</span> <StatusBadge status="Published" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Contact:</span> <StatusBadge status="Published" />
            </div>
            {content?.updatedAt && (
              <Badge variant="secondary" className="ml-auto">
                Last updated: {new Date(content.updatedAt).toLocaleString('en-IN')}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
