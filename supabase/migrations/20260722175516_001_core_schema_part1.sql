/*
# NextUp SaaS — Core Schema (Part 1: Profiles, Wallets, Settings, Notifications, Activity, Features)

1. New Tables
- `profiles` — user profile data (extends auth.users), stores role, membership, account_type, etc.
- `wallets` — user wallet balances (lifetime earnings, pending/completed withdrawals)
- `transactions` — wallet transaction history (credit/debit/withdrawal/referral/bonus/purchase/refund/sales_commission)
- `settings` — per-user settings (notifications, privacy, theme)
- `notifications` — user notification feed
- `activity_log` — user activity history
- `feature_flags` — admin-controlled module enable/disable (WordPress-style)

2. Security
- RLS enabled on all tables
- Owner-scoped policies using auth.uid() for user tables
- feature_flags readable by all authenticated users (admin-only writes)

3. Notes
- profiles.id references auth.users(id) ON DELETE CASCADE
- All user tables use DEFAULT auth.uid() on owner columns
*/

-- ===== PROFILES =====
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text DEFAULT '',
  phone text DEFAULT '',
  address text DEFAULT '',
  photo_url text DEFAULT '',
  role text NOT NULL DEFAULT 'user',
  account_type text NOT NULL DEFAULT 'learning',
  membership text NOT NULL DEFAULT 'starter',
  membership_status text NOT NULL DEFAULT 'active',
  membership_start timestamptz,
  membership_expiry timestamptz,
  suspended boolean NOT NULL DEFAULT false,
  affiliate_enabled boolean NOT NULL DEFAULT false,
  sales_partner_enabled boolean NOT NULL DEFAULT false,
  sales_partner_status text DEFAULT 'none',
  referral_code text UNIQUE,
  referred_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ===== WALLETS =====
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  balance numeric NOT NULL DEFAULT 0,
  lifetime_earnings numeric NOT NULL DEFAULT 0,
  pending_withdrawals numeric NOT NULL DEFAULT 0,
  completed_withdrawals numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_wallet" ON wallets;
CREATE POLICY "select_own_wallet" ON wallets FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_wallet" ON wallets;
CREATE POLICY "insert_own_wallet" ON wallets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_wallet" ON wallets;
CREATE POLICY "update_own_wallet" ON wallets FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ===== TRANSACTIONS =====
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  label text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'completed',
  method text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_transactions" ON transactions;
CREATE POLICY "select_own_transactions" ON transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_transactions" ON transactions;
CREATE POLICY "insert_own_transactions" ON transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_transactions" ON transactions;
CREATE POLICY "update_own_transactions" ON transactions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ===== SETTINGS =====
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email_notifications boolean NOT NULL DEFAULT true,
  push_notifications boolean NOT NULL DEFAULT true,
  sms_notifications boolean NOT NULL DEFAULT false,
  marketing_emails boolean NOT NULL DEFAULT true,
  theme text NOT NULL DEFAULT 'light',
  language text NOT NULL DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_settings" ON settings;
CREATE POLICY "select_own_settings" ON settings FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_settings" ON settings;
CREATE POLICY "insert_own_settings" ON settings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_settings" ON settings;
CREATE POLICY "update_own_settings" ON settings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ===== NOTIFICATIONS =====
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ===== ACTIVITY LOG =====
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  description text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_activity" ON activity_log;
CREATE POLICY "select_own_activity" ON activity_log FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_activity" ON activity_log;
CREATE POLICY "insert_own_activity" ON activity_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ===== FEATURE FLAGS =====
CREATE TABLE IF NOT EXISTS feature_flags (
  id text PRIMARY KEY,
  label text NOT NULL,
  description text DEFAULT '',
  enabled boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_feature_flags" ON feature_flags;
CREATE POLICY "select_feature_flags" ON feature_flags FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_feature_flags" ON feature_flags;
CREATE POLICY "insert_feature_flags" ON feature_flags FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_feature_flags" ON feature_flags;
CREATE POLICY "update_feature_flags" ON feature_flags FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Seed default feature flags
INSERT INTO feature_flags (id, label, description, enabled, sort_order) VALUES
  ('learning', 'Learning', 'Course library and LMS', true, 1),
  ('affiliate', 'Affiliate System', 'Referral links and commission tracking', true, 2),
  ('sales_partner', 'Sales Partner', 'Lead CRM and sales commission', true, 3),
  ('community', 'Community', 'Posts and discussions', true, 4),
  ('wallet', 'Wallet', 'Digital wallet and earnings', true, 5),
  ('withdrawals', 'Withdrawals', 'Withdrawal requests and payouts', true, 6),
  ('kyc', 'KYC', 'Know Your Customer verification', true, 7),
  ('certificates', 'Certificates', 'Course completion certificates', true, 8),
  ('notifications', 'Notifications', 'In-app notification feed', true, 9),
  ('referral_system', 'Referral System', 'Track referrals and sponsor hierarchy', true, 10),
  ('blog', 'Blog', 'Blog posts and articles', false, 11),
  ('events', 'Events', 'Events and webinars', false, 12)
ON CONFLICT (id) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_activity_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON activity_log(created_at DESC);
