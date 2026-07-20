'use client';

import { useEffect, useState } from 'react';
import { FileText, Save, Loader2, Upload, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AdminPageHeader, StatusBadge } from '@/components/admin/admin-page-header';
import { toast } from 'sonner';
import { fetchCmsContent, updateCmsSection, defaultCmsContent, type CmsContent, type CmsSection } from '@/services/cms.service';
import { uploadLogo } from '@/services/storage.service';

const ICON_OPTIONS = ['ShieldCheck', 'Video', 'Users', 'TrendingUp', 'BookOpen', 'Award', 'Rocket', 'Sparkles', 'Target', 'Zap'];

export default function AdminContentPage() {
  const [content, setContent] = useState<CmsContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [savingAll, setSavingAll] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const fallback = defaultCmsContent();
  const [siteForm, setSiteForm] = useState(fallback.site);
  const [heroForm, setHeroForm] = useState(fallback.hero);
  const [aboutForm, setAboutForm] = useState(fallback.about);
  const [featuresForm, setFeaturesForm] = useState(fallback.features);
  const [statsForm, setStatsForm] = useState(fallback.stats);
  const [pricingForm, setPricingForm] = useState(fallback.pricing);
  const [faqForm, setFaqForm] = useState(fallback.faq);
  const [footerForm, setFooterForm] = useState(fallback.footer);
  const [contactForm, setContactForm] = useState(fallback.contact);
  const [socialForm, setSocialForm] = useState(fallback.social);
  const [legalForm, setLegalForm] = useState(fallback.legal);
  const [companyForm, setCompanyForm] = useState(fallback.company);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchCmsContent();
        if (cancelled) return;
        const c = data ?? fallback;
        setContent(c);
        setSiteForm(c.site);
        setHeroForm(c.hero);
        setAboutForm(c.about);
        setFeaturesForm(c.features);
        setStatsForm(c.stats);
        setPricingForm(c.pricing);
        setFaqForm(c.faq);
        setFooterForm(c.footer);
        setContactForm(c.contact);
        setSocialForm(c.social);
        setLegalForm(c.legal);
        setCompanyForm(c.company);
      } catch {
        if (cancelled) return;
        toast.error('Using default content — database unavailable');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveSection(section: CmsSection, value: unknown) {
    setSavingSection(section);
    try {
      await updateCmsSection(section, value);
      toast.success(`${section} saved`);
    } catch {
      toast.error(`Failed to save ${section}`);
    } finally {
      setSavingSection(null);
    }
  }

  async function saveAll() {
    setSavingAll(true);
    try {
      const sections: [CmsSection, unknown][] = [
        ['site', siteForm], ['hero', heroForm], ['about', aboutForm], ['features', featuresForm],
        ['stats', statsForm], ['pricing', pricingForm], ['faq', faqForm], ['footer', footerForm],
        ['contact', contactForm], ['social', socialForm], ['legal', legalForm], ['company', companyForm],
      ];
      for (const [section, value] of sections) {
        await updateCmsSection(section, value);
      }
      toast.success('All changes saved and published');
    } catch {
      toast.error('Failed to save some sections');
    } finally {
      setSavingAll(false);
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const url = await uploadLogo(file);
      setSiteForm((f) => ({ ...f, logo: url }));
      await updateCmsSection('site', { ...siteForm, logo: url });
      toast.success('Logo uploaded');
    } catch {
      toast.error('Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={FileText}
        title="Website content"
        subtitle="Edit the public-facing marketing copy, contact details and company information. Changes publish immediately."
        actions={
          <Button size="sm" className="bg-brand-gradient font-semibold" onClick={saveAll} disabled={savingAll}>
            {savingAll ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            Save all
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Site identity */}
        <Card className="card-premium">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">Site identity</CardTitle>
            <Button variant="outline" size="sm" disabled={savingSection === 'site'} onClick={() => saveSection('site', siteForm)}>
              {savingSection === 'site' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} Save
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Website name</Label>
              <Input value={siteForm.name} onChange={(e) => setSiteForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Logo</Label>
              <div className="flex items-center gap-4">
                {siteForm.logo ? (
                  <img src={siteForm.logo} alt="Logo" className="h-12 w-12 rounded-lg object-cover border border-border" />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-muted-foreground text-xs">No logo</span>
                )}
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-secondary transition-colors">
                    {uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Upload
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hero */}
        <Card className="card-premium">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">Hero section</CardTitle>
            <Button variant="outline" size="sm" disabled={savingSection === 'hero'} onClick={() => saveSection('hero', heroForm)}>
              {savingSection === 'hero' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} Save
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Eyebrow</Label>
              <Input value={heroForm.eyebrow} onChange={(e) => setHeroForm((f) => ({ ...f, eyebrow: e.target.value }))} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5"><Label>Title line 1</Label><Input value={heroForm.titleLine1} onChange={(e) => setHeroForm((f) => ({ ...f, titleLine1: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Title line 2</Label><Input value={heroForm.titleLine2} onChange={(e) => setHeroForm((f) => ({ ...f, titleLine2: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Title line 3</Label><Input value={heroForm.titleLine3} onChange={(e) => setHeroForm((f) => ({ ...f, titleLine3: e.target.value }))} /></div>
            </div>
            <div className="space-y-1.5">
              <Label>Subtitle</Label>
              <Textarea rows={3} value={heroForm.subtitle} onChange={(e) => setHeroForm((f) => ({ ...f, subtitle: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Primary CTA</Label><Input value={heroForm.primaryCta} onChange={(e) => setHeroForm((f) => ({ ...f, primaryCta: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Secondary CTA</Label><Input value={heroForm.secondaryCta} onChange={(e) => setHeroForm((f) => ({ ...f, secondaryCta: e.target.value }))} /></div>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="card-premium">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">About</CardTitle>
            <Button variant="outline" size="sm" disabled={savingSection === 'about'} onClick={() => saveSection('about', aboutForm)}>
              {savingSection === 'about' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} Save
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5"><Label>Title</Label><Input value={aboutForm.title} onChange={(e) => setAboutForm((f) => ({ ...f, title: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Subtitle</Label><Input value={aboutForm.subtitle} onChange={(e) => setAboutForm((f) => ({ ...f, subtitle: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Body</Label><Textarea rows={4} value={aboutForm.body} onChange={(e) => setAboutForm((f) => ({ ...f, body: e.target.value }))} /></div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="card-premium">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">Features</CardTitle>
            <Button variant="outline" size="sm" disabled={savingSection === 'features'} onClick={() => saveSection('features', featuresForm)}>
              {savingSection === 'features' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} Save
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {featuresForm.map((feat, i) => (
              <div key={i} className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-3 space-y-1.5">
                  <Label>Icon</Label>
                  <Input value={feat.icon} onChange={(e) => setFeaturesForm((arr) => arr.map((x, idx) => idx === i ? { ...x, icon: e.target.value } : x))} list="icon-list" />
                </div>
                <div className="col-span-4 space-y-1.5">
                  <Label>Title</Label>
                  <Input value={feat.title} onChange={(e) => setFeaturesForm((arr) => arr.map((x, idx) => idx === i ? { ...x, title: e.target.value } : x))} />
                </div>
                <div className="col-span-4 space-y-1.5">
                  <Label>Text</Label>
                  <Input value={feat.text} onChange={(e) => setFeaturesForm((arr) => arr.map((x, idx) => idx === i ? { ...x, text: e.target.value } : x))} />
                </div>
                <div className="col-span-1">
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => setFeaturesForm((arr) => arr.filter((_, idx) => idx !== i))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setFeaturesForm((arr) => [...arr, { icon: 'Sparkles', title: '', text: '' }])}>
              <Plus className="h-4 w-4 mr-1" /> Add feature
            </Button>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="card-premium">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">Statistics</CardTitle>
            <Button variant="outline" size="sm" disabled={savingSection === 'stats'} onClick={() => saveSection('stats', statsForm)}>
              {savingSection === 'stats' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} Save
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {statsForm.map((s, i) => (
              <div key={i} className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-4 space-y-1.5"><Label>Label</Label><Input value={s.label} onChange={(e) => setStatsForm((arr) => arr.map((x, idx) => idx === i ? { ...x, label: e.target.value } : x))} /></div>
                <div className="col-span-3 space-y-1.5"><Label>Value</Label><Input value={s.value} onChange={(e) => setStatsForm((arr) => arr.map((x, idx) => idx === i ? { ...x, value: e.target.value } : x))} /></div>
                <div className="col-span-2 space-y-1.5"><Label>Suffix</Label><Input value={s.suffix} onChange={(e) => setStatsForm((arr) => arr.map((x, idx) => idx === i ? { ...x, suffix: e.target.value } : x))} /></div>
                <div className="col-span-2 space-y-1.5"><Label>Icon</Label><Input value={s.icon} onChange={(e) => setStatsForm((arr) => arr.map((x, idx) => idx === i ? { ...x, icon: e.target.value } : x))} list="icon-list" /></div>
                <div className="col-span-1"><Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => setStatsForm((arr) => arr.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4" /></Button></div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setStatsForm((arr) => [...arr, { label: '', value: '0', suffix: '', icon: 'Users' }])}>
              <Plus className="h-4 w-4 mr-1" /> Add stat
            </Button>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card className="card-premium lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">Pricing section</CardTitle>
            <Button variant="outline" size="sm" disabled={savingSection === 'pricing'} onClick={() => saveSection('pricing', pricingForm)}>
              {savingSection === 'pricing' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} Save
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Section title</Label><Input value={pricingForm.title} onChange={(e) => setPricingForm((f) => ({ ...f, title: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Section subtitle</Label><Input value={pricingForm.subtitle} onChange={(e) => setPricingForm((f) => ({ ...f, subtitle: e.target.value }))} /></div>
            </div>
            <div className="space-y-3">
              {pricingForm.plans.map((p, i) => (
                <div key={i} className="rounded-xl border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Plan {i + 1}: {p.name}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setPricingForm((f) => ({ ...f, plans: f.plans.filter((_, idx) => idx !== i) }))}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="space-y-1.5"><Label>Name</Label><Input value={p.name} onChange={(e) => setPricingForm((f) => ({ ...f, plans: f.plans.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x) }))} /></div>
                    <div className="space-y-1.5"><Label>Price</Label><Input value={p.price} onChange={(e) => setPricingForm((f) => ({ ...f, plans: f.plans.map((x, idx) => idx === i ? { ...x, price: e.target.value } : x) }))} /></div>
                    <div className="space-y-1.5"><Label>Period</Label><Input value={p.period} onChange={(e) => setPricingForm((f) => ({ ...f, plans: f.plans.map((x, idx) => idx === i ? { ...x, period: e.target.value } : x) }))} /></div>
                    <div className="space-y-1.5"><Label>Badge</Label><Input value={p.badge} onChange={(e) => setPricingForm((f) => ({ ...f, plans: f.plans.map((x, idx) => idx === i ? { ...x, badge: e.target.value } : x) }))} /></div>
                  </div>
                  <div className="space-y-1.5"><Label>Description</Label><Input value={p.description} onChange={(e) => setPricingForm((f) => ({ ...f, plans: f.plans.map((x, idx) => idx === i ? { ...x, description: e.target.value } : x) }))} /></div>
                  <div className="space-y-1.5"><Label>Features (one per line)</Label><Textarea rows={4} value={p.features.join('\n')} onChange={(e) => setPricingForm((f) => ({ ...f, plans: f.plans.map((x, idx) => idx === i ? { ...x, features: e.target.value.split('\n') } : x) }))} /></div>
                  <div className="flex items-center gap-4">
                    <div className="space-y-1.5 flex-1"><Label>CTA label</Label><Input value={p.cta} onChange={(e) => setPricingForm((f) => ({ ...f, plans: f.plans.map((x, idx) => idx === i ? { ...x, cta: e.target.value } : x) }))} /></div>
                    <label className="flex items-center gap-2 pt-6">
                      <input type="checkbox" checked={p.featured} onChange={(e) => setPricingForm((f) => ({ ...f, plans: f.plans.map((x, idx) => idx === i ? { ...x, featured: e.target.checked } : x) }))} />
                      <span className="text-sm">Featured</span>
                    </label>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setPricingForm((f) => ({ ...f, plans: [...f.plans, { name: '', price: '₹0', period: '/month', description: '', features: [], cta: '', featured: false, badge: '' }] }))}>
                <Plus className="h-4 w-4 mr-1" /> Add plan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="card-premium">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">FAQ</CardTitle>
            <Button variant="outline" size="sm" disabled={savingSection === 'faq'} onClick={() => saveSection('faq', faqForm)}>
              {savingSection === 'faq' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} Save
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {faqForm.map((f, i) => (
              <div key={i} className="space-y-2 rounded-xl border border-border p-3">
                <div className="flex items-center gap-2">
                  <Input className="flex-1" placeholder="Question" value={f.q} onChange={(e) => setFaqForm((arr) => arr.map((x, idx) => idx === i ? { ...x, q: e.target.value } : x))} />
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive shrink-0" onClick={() => setFaqForm((arr) => arr.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4" /></Button>
                </div>
                <Textarea rows={2} placeholder="Answer" value={f.a} onChange={(e) => setFaqForm((arr) => arr.map((x, idx) => idx === i ? { ...x, a: e.target.value } : x))} />
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setFaqForm((arr) => [...arr, { q: '', a: '' }])}>
              <Plus className="h-4 w-4 mr-1" /> Add FAQ
            </Button>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="card-premium">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">Contact</CardTitle>
            <Button variant="outline" size="sm" disabled={savingSection === 'contact'} onClick={() => saveSection('contact', contactForm)}>
              {savingSection === 'contact' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} Save
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Email</Label><Input value={contactForm.email} onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Phone</Label><Input value={contactForm.phone} onChange={(e) => setContactForm((f) => ({ ...f, phone: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>WhatsApp</Label><Input value={contactForm.whatsapp} onChange={(e) => setContactForm((f) => ({ ...f, whatsapp: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Support email</Label><Input value={contactForm.supportEmail} onChange={(e) => setContactForm((f) => ({ ...f, supportEmail: e.target.value }))} /></div>
            </div>
            <div className="space-y-1.5"><Label>Address</Label><Textarea rows={2} value={contactForm.address} onChange={(e) => setContactForm((f) => ({ ...f, address: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Hours</Label><Input value={contactForm.hours} onChange={(e) => setContactForm((f) => ({ ...f, hours: e.target.value }))} /></div>
          </CardContent>
        </Card>

        {/* Social */}
        <Card className="card-premium">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">Social links</CardTitle>
            <Button variant="outline" size="sm" disabled={savingSection === 'social'} onClick={() => saveSection('social', socialForm)}>
              {savingSection === 'social' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} Save
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Facebook</Label><Input value={socialForm.facebook} onChange={(e) => setSocialForm((f) => ({ ...f, facebook: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Instagram</Label><Input value={socialForm.instagram} onChange={(e) => setSocialForm((f) => ({ ...f, instagram: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>LinkedIn</Label><Input value={socialForm.linkedin} onChange={(e) => setSocialForm((f) => ({ ...f, linkedin: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>YouTube</Label><Input value={socialForm.youtube} onChange={(e) => setSocialForm((f) => ({ ...f, youtube: e.target.value }))} /></div>
              <div className="space-y-1.5 md:col-span-2"><Label>Twitter / X</Label><Input value={socialForm.twitter} onChange={(e) => setSocialForm((f) => ({ ...f, twitter: e.target.value }))} /></div>
            </div>
          </CardContent>
        </Card>

        {/* Footer & company */}
        <Card className="card-premium">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">Footer & company</CardTitle>
            <Button variant="outline" size="sm" disabled={savingSection === 'footer'} onClick={() => { saveSection('footer', footerForm); saveSection('company', companyForm); }}>
              {savingSection === 'footer' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} Save
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5"><Label>Footer description</Label><Textarea rows={3} value={footerForm.description} onChange={(e) => setFooterForm((f) => ({ ...f, description: e.target.value }))} /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Footer email</Label><Input value={footerForm.email} onChange={(e) => setFooterForm((f) => ({ ...f, email: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Footer phone</Label><Input value={footerForm.phone} onChange={(e) => setFooterForm((f) => ({ ...f, phone: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1.5"><Label>Company name</Label><Input value={companyForm.name} onChange={(e) => setCompanyForm((f) => ({ ...f, name: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Tagline</Label><Input value={companyForm.tagline} onChange={(e) => setCompanyForm((f) => ({ ...f, tagline: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Founded</Label><Input value={companyForm.founded} onChange={(e) => setCompanyForm((f) => ({ ...f, founded: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>GSTIN</Label><Input value={companyForm.gstin} onChange={(e) => setCompanyForm((f) => ({ ...f, gstin: e.target.value }))} /></div>
            </div>
            <div className="space-y-1.5"><Label>Legal name</Label><Input value={companyForm.legalName} onChange={(e) => setCompanyForm((f) => ({ ...f, legalName: e.target.value }))} /></div>
          </CardContent>
        </Card>

        {/* Legal */}
        <Card className="card-premium lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">Legal pages</CardTitle>
            <Button variant="outline" size="sm" disabled={savingSection === 'legal'} onClick={() => saveSection('legal', legalForm)}>
              {savingSection === 'legal' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} Save
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5"><Label>Privacy policy</Label><Textarea rows={5} value={legalForm.privacyPolicy} onChange={(e) => setLegalForm((f) => ({ ...f, privacyPolicy: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Terms &amp; conditions</Label><Textarea rows={5} value={legalForm.terms} onChange={(e) => setLegalForm((f) => ({ ...f, terms: e.target.value }))} /></div>
          </CardContent>
        </Card>
      </div>

      <datalist id="icon-list">{ICON_OPTIONS.map((ic) => <option key={ic} value={ic} />)}</datalist>

      <Card className="card-premium">
        <CardHeader><CardTitle className="text-lg">Publish status</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2"><span className="text-muted-foreground">Status:</span> <StatusBadge status="Published" /></div>
            {content?.updatedAt && (
              <Badge variant="secondary" className="ml-auto">Last updated: {new Date(content.updatedAt).toLocaleString('en-IN')}</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
