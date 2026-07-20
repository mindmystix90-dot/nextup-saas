'use client';

import { CreditCard, Plus, Pencil, Trash2, Check, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminPageHeader, StatusBadge } from '@/components/admin/admin-page-header';
import { adminPricingPlans } from '@/lib/data/admin';
import { toast } from 'sonner';

export default function AdminPricingPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={CreditCard}
        title="Pricing plans"
        subtitle="Add, edit and archive subscription plans."
        actions={
          <Button size="sm" className="bg-brand-gradient font-semibold" onClick={() => toast.info('Add plan (demo)')}>
            <Plus className="h-4 w-4 mr-1" /> Add plan
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        {adminPricingPlans.map((plan) => (
          <Card
            key={plan.id}
            className={`card-premium relative overflow-hidden ${plan.featured ? 'border-primary/40 shadow-glow' : ''}`}
          >
            {plan.badge && (
              <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-brand-gradient px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                <Star className="h-3 w-3 fill-white" /> {plan.badge}
              </span>
            )}
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <StatusBadge status={plan.status} />
              </div>
              <p className="text-xs text-muted-foreground">{plan.id}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="font-display text-3xl font-bold">{plan.price}</span>
                <span className="text-sm text-muted-foreground"> {plan.period}</span>
              </div>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
              <ul className="space-y-2 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-success" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => toast.info(`Edit ${plan.name} (demo)`)}>
                  <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => toast.error(`Delete ${plan.name} (demo)`)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="text-lg">Plan summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Total plans</p>
              <p className="font-display text-xl font-bold">{adminPricingPlans.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="font-display text-xl font-bold text-success">
                {adminPricingPlans.filter((p) => p.status === 'Active').length}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Archived</p>
              <p className="font-display text-xl font-bold text-muted-foreground">
                {adminPricingPlans.filter((p) => p.status === 'Archived').length}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Featured</p>
              <p className="font-display text-xl font-bold text-primary">
                {adminPricingPlans.filter((p) => p.featured).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
