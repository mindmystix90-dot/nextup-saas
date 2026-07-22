/*
# NextUp SaaS — Seed default pricing plans

1. Data
- Insert 3 default pricing plans: Starter (free), Pro (₹499/month), Lifetime (₹4999 one-time)
- All plans are active by default

2. Notes
- Uses ON CONFLICT DO NOTHING for idempotency
- No user data affected
*/

INSERT INTO pricing_plans (name, price, period, description, features, cta, featured, badge, active, sort_order) VALUES
  ('Starter', 0, 'forever', 'Get started with basic learning access',
    ARRAY['Access to free courses', 'Community access', 'Basic dashboard', 'Wallet account'], 'Get Started', false, '', true, 1),
  ('Pro', 499, 'month', 'Unlock all courses and premium features',
    ARRAY['Access to ALL courses', 'Completion certificates', 'Priority support', 'Affiliate program access', 'Advanced analytics'], 'Upgrade to Pro', true, 'Most Popular', true, 2),
  ('Lifetime', 4999, 'one-time', 'Pay once, access forever',
    ARRAY['Everything in Pro', 'Lifetime access', 'All future courses', 'Priority support', 'Exclusive community'], 'Get Lifetime', false, 'Best Value', true, 3)
ON CONFLICT (id) DO NOTHING;
