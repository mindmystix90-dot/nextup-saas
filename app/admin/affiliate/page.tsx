'use client';

import { useEffect, useState } from 'react';
import { Network, Search, Plus, Pencil, Pause, Play, Ban, Building2, Loader2, Award, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AdminPageHeader, StatusBadge } from '@/components/admin/admin-page-header';
import { toast } from 'sonner';
import { fetchSalesPartners, createSalesPartner, updateSalesPartner } from '@/services/partners.service';
import { fetchAllAffiliateStats, adminSetAffiliateEnabled } from '@/services/affiliate.service';
import type { SalesPartner, AffiliateStats } from '@/types';

export default function AdminAffiliatePage() {
  const [activeTab, setActiveTab] = useState('affiliates');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  // Affiliate stats & list from Firestore
  const [affiliates, setAffiliates] = useState<AffiliateStats[]>([]);
  const [loadingAffiliates, setLoadingAffiliates] = useState(true);

  // Sales partners
  const [partners, setPartners] = useState<SalesPartner[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPartner, setEditPartner] = useState<SalesPartner | null>(null);
  const [savingPartner, setSavingPartner] = useState(false);

  const [partnerForm, setPartnerForm] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    tier: 'Gold' as SalesPartner['tier'],
    commissionRate: 25,
    status: 'Active' as SalesPartner['status'],
  });

  async function loadPartners() {
    try {
      const data = await fetchSalesPartners();
      setPartners(data);
    } catch {
      toast.error('Failed to load sales partners');
    } finally {
      setLoadingPartners(false);
    }
  }

  async function loadAffiliates() {
    try {
      const data = await fetchAllAffiliateStats();
      setAffiliates(data);
    } catch {
      toast.error('Failed to load affiliate accounts');
    } finally {
      setLoadingAffiliates(false);
    }
  }

  useEffect(() => {
    loadPartners();
    loadAffiliates();
  }, []);

  function openCreatePartner() {
    setEditPartner(null);
    setPartnerForm({
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      tier: 'Gold',
      commissionRate: 25,
      status: 'Active',
    });
    setDialogOpen(true);
  }

  function openEditPartner(sp: SalesPartner) {
    setEditPartner(sp);
    setPartnerForm({
      companyName: sp.companyName,
      contactPerson: sp.contactPerson,
      email: sp.email,
      phone: sp.phone,
      tier: sp.tier,
      commissionRate: sp.commissionRate,
      status: sp.status,
    });
    setDialogOpen(true);
  }

  async function handleSavePartner() {
    if (!partnerForm.companyName.trim() || !partnerForm.contactPerson.trim() || !partnerForm.email.trim()) {
      toast.error('Company, contact person, and email are required.');
      return;
    }
    setSavingPartner(true);
    try {
      if (editPartner) {
        await updateSalesPartner(editPartner.id, partnerForm);
        toast.success(`Updated ${partnerForm.companyName}`);
      } else {
        await createSalesPartner(partnerForm);
        toast.success(`Added partner ${partnerForm.companyName}`);
      }
      setDialogOpen(false);
      await loadPartners();
    } catch {
      toast.error('Failed to save sales partner');
    } finally {
      setSavingPartner(false);
    }
  }

  const filteredAffiliates = affiliates.filter((a) => {
    const matchQuery =
      a.uid.toLowerCase().includes(query.toLowerCase()) ||
      a.referralCode.toLowerCase().includes(query.toLowerCase());
    return matchQuery;
  });

  const totalReferrals = affiliates.reduce((acc, a) => acc + (a.registrations || 0), 0);
  const totalPayouts = affiliates.reduce((acc, a) => acc + (a.paidCommission || 0), 0);
  const totalPending = affiliates.reduce((acc, a) => acc + (a.pendingCommission || 0), 0);

  const statsList = [
    { label: 'Total Affiliates', value: affiliates.length.toString(), delta: '+12%' },
    { label: 'Total Referrals', value: totalReferrals.toString(), delta: '+18%' },
    { label: 'Pending Payouts', value: `₹${totalPending.toLocaleString()}`, delta: 'Action required' },
    { label: 'Total Disbursed', value: `₹${totalPayouts.toLocaleString()}`, delta: 'All time' },
  ];

  const filteredPartners = partners.filter((sp) =>
    sp.companyName.toLowerCase().includes(query.toLowerCase()) ||
    sp.contactPerson.toLowerCase().includes(query.toLowerCase()) ||
    sp.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Network}
        title="Affiliates & Sales Partners"
        subtitle="Manage referral networks, enterprise sales partner tiers, and commission payouts."
        actions={
          <Button onClick={openCreatePartner} className="bg-brand-gradient font-semibold">
            <Plus className="h-4 w-4 mr-1" /> Add Sales Partner
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsList.map((s) => (
          <Card key={s.label} className="card-premium">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient-soft text-primary font-bold">
                  ₹
                </span>
                <span className="text-xs text-muted-foreground">{s.delta}</span>
              </div>
              <p className="mt-4 font-display text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="affiliates">Affiliate Partners</TabsTrigger>
          <TabsTrigger value="sales-partners">Enterprise Sales Partners</TabsTrigger>
        </TabsList>

        {/* Affiliate Partners Tab */}
        <TabsContent value="affiliates" className="space-y-4">
          <Card className="card-premium">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-lg">Individual Affiliates ({filteredAffiliates.length})</CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search UID or code..."
                    className="pl-10"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingAffiliates ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : filteredAffiliates.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Network className="mx-auto h-10 w-10 mb-3 opacity-40" />
                  <p className="text-sm">No individual affiliates found in Firestore.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User / Referral Code</TableHead>
                      <TableHead>UID</TableHead>
                      <TableHead className="text-right">Registrations</TableHead>
                      <TableHead className="text-right">Paid Commission</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAffiliates.map((a) => (
                      <TableRow key={a.uid}>
                        <TableCell>
                          <p className="font-semibold text-foreground">{a.referralCode}</p>
                          <p className="text-xs text-muted-foreground">Rate: {a.commissionRate}%</p>
                        </TableCell>
                        <TableCell className="text-xs font-mono">{a.uid}</TableCell>
                        <TableCell className="text-right font-medium">{a.registrations}</TableCell>
                        <TableCell className="text-right font-semibold text-success">₹{a.paidCommission.toLocaleString()}</TableCell>
                        <TableCell><StatusBadge status={a.enabled ? 'Active' : 'Paused'} /></TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={async () => {
                            try {
                              await adminSetAffiliateEnabled(a.uid, !a.enabled);
                              toast.success(`Toggled status for ${a.referralCode}`);
                              loadAffiliates();
                            } catch {
                              toast.error('Failed to update status');
                            }
                          }}>
                            {a.enabled ? 'Pause' : 'Enable'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enterprise Sales Partners Tab */}
        <TabsContent value="sales-partners" className="space-y-4">
          <Card className="card-premium">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg">Enterprise Sales Partners ({filteredPartners.length})</CardTitle>
                <CardDescription>Agencies and institutional sales partners with custom tier commissions.</CardDescription>
              </div>
              <Button onClick={openCreatePartner} size="sm" className="bg-brand-gradient">
                <Plus className="h-4 w-4 mr-1" /> Add Partner
              </Button>
            </CardHeader>
            <CardContent>
              {loadingPartners ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : filteredPartners.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Building2 className="mx-auto h-10 w-10 mb-3 opacity-40" />
                  <p className="text-sm">No enterprise sales partners found.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company & Contact</TableHead>
                      <TableHead>Partner Tier</TableHead>
                      <TableHead>Commission Rate</TableHead>
                      <TableHead className="text-right">Total Sales</TableHead>
                      <TableHead className="text-right">Total Commission</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPartners.map((sp) => (
                      <TableRow key={sp.id}>
                        <TableCell>
                          <p className="font-semibold text-foreground">{sp.companyName}</p>
                          <p className="text-xs text-muted-foreground">{sp.contactPerson} · {sp.email}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-primary text-primary">
                            <Award className="h-3 w-3 mr-1" /> {sp.tier}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">{sp.commissionRate}%</TableCell>
                        <TableCell className="text-right font-medium">₹{sp.totalSales.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-semibold text-success">₹{sp.totalCommission.toLocaleString()}</TableCell>
                        <TableCell><StatusBadge status={sp.status} /></TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => openEditPartner(sp)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Partner Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editPartner ? 'Edit Sales Partner' : 'Add Sales Partner'}</DialogTitle>
            <DialogDescription>Set partner details, commission rate, and tier structure.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-sm">
            <div className="space-y-1">
              <Label>Company / Agency Name *</Label>
              <Input value={partnerForm.companyName} onChange={(e) => setPartnerForm({ ...partnerForm, companyName: e.target.value })} placeholder="e.g. SkillUp Solutions" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Contact Person *</Label>
                <Input value={partnerForm.contactPerson} onChange={(e) => setPartnerForm({ ...partnerForm, contactPerson: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Email *</Label>
                <Input type="email" value={partnerForm.email} onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Partner Tier</Label>
                <Select value={partnerForm.tier} onValueChange={(v) => setPartnerForm({ ...partnerForm, tier: v as SalesPartner['tier'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Silver">Silver (20%)</SelectItem>
                    <SelectItem value="Gold">Gold (25%)</SelectItem>
                    <SelectItem value="Platinum">Platinum (35%)</SelectItem>
                    <SelectItem value="Diamond">Diamond (40%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Commission Rate (%)</Label>
                <Input type="number" value={partnerForm.commissionRate} onChange={(e) => setPartnerForm({ ...partnerForm, commissionRate: Number(e.target.value) })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Phone Number</Label>
              <Input value={partnerForm.phone} onChange={(e) => setPartnerForm({ ...partnerForm, phone: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSavePartner} disabled={savingPartner} className="bg-brand-gradient font-semibold">
              {savingPartner && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Partner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
