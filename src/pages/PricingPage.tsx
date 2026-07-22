import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { fetchPricingPlans } from '@/services/general.service';
import type { PricingPlan } from '@/types';
import { Spinner } from '@/components/ui';

export default function PricingPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPricingPlans().then((p) => { setPlans(p); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-brand-600 flex items-center justify-center"><span className="text-white font-bold">N</span></div>
            <span className="text-xl font-bold font-display">NextUp</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/contact" className="text-sm font-medium hover:text-brand-600">Contact</Link>
            <Link to="/login" className="text-sm font-medium hover:text-brand-600">Sign in</Link>
            <Link to="/register" className="btn-primary text-sm">Get started</Link>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-display mb-3">Simple, transparent pricing</h1>
          <p className="text-muted-foreground">Choose the plan that fits your goals</p>
        </div>

        {loading ? <Spinner /> : plans.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg font-semibold">No pricing plans available yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Please check back soon.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div key={plan.id} className={`card p-8 relative ${plan.featured ? 'border-2 border-brand-600 shadow-lg' : ''}`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-brand-600 text-white text-xs font-semibold">
                    {plan.badge}
                  </div>
                )}
                <h3 className="text-xl font-bold font-display mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold font-display">₹{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-success mt-0.5 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className={`block text-center py-2.5 rounded-lg font-semibold transition-colors ${plan.featured ? 'bg-brand-600 text-white hover:bg-brand-700' : 'bg-secondary hover:bg-secondary/80'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
