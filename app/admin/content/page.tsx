'use client';

import { FileText, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AdminPageHeader, StatusBadge } from '@/components/admin/admin-page-header';
import { adminWebsiteContent } from '@/lib/data/admin';
import { toast } from 'sonner';

function handleSave(label: string) {
  toast.success(`${label} saved (demo)`);
}

export default function AdminContentPage() {
  const { hero, stats, footer, contact, company } = adminWebsiteContent;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={FileText}
        title="Website content"
        subtitle="Edit the public-facing marketing copy, contact details and company information."
        actions={
          <Button size="sm" className="bg-brand-gradient font-semibold" onClick={() => toast.success('All changes saved (demo)')}>
            <Save className="h-4 w-4 mr-1" /> Save all
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="card-premium">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">Hero section</CardTitle>
            <Button variant="outline" size="sm" onClick={() => handleSave('Hero section')}>Save</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="hero-eyebrow">Eyebrow</Label>
              <Input id="hero-eyebrow" defaultValue={hero.eyebrow} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="hero-l1">Title line 1</Label>
                <Input id="hero-l1" defaultValue={hero.titleLine1} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hero-l2">Title line 2</Label>
                <Input id="hero-l2" defaultValue={hero.titleLine2} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hero-l3">Title line 3</Label>
                <Input id="hero-l3" defaultValue={hero.titleLine3} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hero-sub">Subtitle</Label>
              <Textarea id="hero-sub" rows={3} defaultValue={hero.subtitle} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="hero-cta1">Primary CTA</Label>
                <Input id="hero-cta1" defaultValue={hero.primaryCta} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hero-cta2">Secondary CTA</Label>
                <Input id="hero-cta2" defaultValue={hero.secondaryCta} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">Statistics</CardTitle>
            <Button variant="outline" size="sm" onClick={() => handleSave('Statistics')}>Save</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.map((s) => (
              <div key={s.label} className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-4 space-y-1.5">
                  <Label>{s.label}</Label>
                  <Input defaultValue={s.label} />
                </div>
                <div className="col-span-3 space-y-1.5">
                  <Label>Value</Label>
                  <Input defaultValue={s.value} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Suffix</Label>
                  <Input defaultValue={s.suffix} />
                </div>
                <div className="col-span-3 space-y-1.5">
                  <Label>Icon</Label>
                  <Input defaultValue={s.icon} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">Contact</CardTitle>
            <Button variant="outline" size="sm" onClick={() => handleSave('Contact')}>Save</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="contact-email">Email</Label>
                <Input id="contact-email" defaultValue={contact.email} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-phone">Phone</Label>
                <Input id="contact-phone" defaultValue={contact.phone} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-address">Address</Label>
              <Textarea id="contact-address" rows={2} defaultValue={contact.address} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-hours">Hours</Label>
              <Input id="contact-hours" defaultValue={contact.hours} />
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">Footer & company</CardTitle>
            <Button variant="outline" size="sm" onClick={() => handleSave('Footer & company')}>Save</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="footer-desc">Footer description</Label>
              <Textarea id="footer-desc" rows={3} defaultValue={footer.description} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="footer-email">Footer email</Label>
                <Input id="footer-email" defaultValue={footer.email} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="footer-phone">Footer phone</Label>
                <Input id="footer-phone" defaultValue={footer.phone} />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="co-name">Company name</Label>
                <Input id="co-name" defaultValue={company.name} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="co-tag">Tagline</Label>
                <Input id="co-tag" defaultValue={company.tagline} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="co-founded">Founded</Label>
                <Input id="co-founded" defaultValue={company.founded} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="co-gstin">GSTIN</Label>
                <Input id="co-gstin" defaultValue={company.gstin} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="co-legal">Legal name</Label>
              <Input id="co-legal" defaultValue={company.legalName} />
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
            <Button variant="outline" size="sm" className="ml-auto" onClick={() => toast.success('Changes published (demo)')}>
              Publish changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
