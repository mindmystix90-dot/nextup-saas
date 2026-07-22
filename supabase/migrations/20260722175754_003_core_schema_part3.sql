/*
# NextUp SaaS — Core Schema (Part 3: Affiliate, Referrals, Community, Leads, Sales Records, Certificates)

1. New Tables
- `affiliate_stats` — per-user affiliate dashboard stats (code, clicks, registrations, sales, commission)
- `referrals` — referral records (referrer, referred user, status, commission)
- `community_posts` — community forum posts
- `community_likes` — likes on community posts
- `community_comments` — comments on community posts
- `leads` — sales leads assigned to sales partners
- `sales_records` — closed sales by sales partners
- `sales_partner_config` — admin config for sales partner module
- `certificates` — course completion certificates
- `contact_submissions` — contact form submissions

2. Security
- RLS enabled on all tables with owner-scoped policies using auth.uid()
- Community content readable by all authenticated
- Leads readable by assigned sales partner + when unassigned

3. Notes
- Leads track status: new → called → interested → follow_up → closed/rejected/no_answer
- sales_partner_config is a singleton config row
*/

-- ===== AFFILIATE STATS =====
CREATE TABLE IF NOT EXISTS affiliate_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  referral_code text UNIQUE,
  referral_link text DEFAULT '',
  enabled boolean NOT NULL DEFAULT false,
  clicks int NOT NULL DEFAULT 0,
  registrations int NOT NULL DEFAULT 0,
  sales int NOT NULL DEFAULT 0,
  pending_commission numeric NOT NULL DEFAULT 0,
  paid_commission numeric NOT NULL DEFAULT 0,
  available_balance numeric NOT NULL DEFAULT 0,
  commission_rate numeric NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE affiliate_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_affiliate" ON affiliate_stats;
CREATE POLICY "select_own_affiliate" ON affiliate_stats FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_affiliate" ON affiliate_stats;
CREATE POLICY "insert_own_affiliate" ON affiliate_stats FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_affiliate" ON affiliate_stats;
CREATE POLICY "update_own_affiliate" ON affiliate_stats FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ===== REFERRALS =====
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  referred_name text NOT NULL DEFAULT '',
  referred_email text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'clicked',
  commission numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_referrals" ON referrals;
CREATE POLICY "select_own_referrals" ON referrals FOR SELECT TO authenticated USING (auth.uid() = referrer_id);
DROP POLICY IF EXISTS "insert_own_referrals" ON referrals;
CREATE POLICY "insert_own_referrals" ON referrals FOR INSERT TO authenticated WITH CHECK (auth.uid() = referrer_id);
DROP POLICY IF EXISTS "update_own_referrals" ON referrals;
CREATE POLICY "update_own_referrals" ON referrals FOR UPDATE TO authenticated USING (auth.uid() = referrer_id) WITH CHECK (auth.uid() = referrer_id);

-- ===== COMMUNITY POSTS =====
CREATE TABLE IF NOT EXISTS community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name text NOT NULL DEFAULT '',
  user_avatar text DEFAULT '',
  title text NOT NULL,
  content text NOT NULL,
  category text DEFAULT 'general',
  likes_count int NOT NULL DEFAULT 0,
  comments_count int NOT NULL DEFAULT 0,
  pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_community_posts" ON community_posts;
CREATE POLICY "select_community_posts" ON community_posts FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_community_posts" ON community_posts;
CREATE POLICY "insert_community_posts" ON community_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_community_posts" ON community_posts;
CREATE POLICY "update_community_posts" ON community_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_community_posts" ON community_posts;
CREATE POLICY "delete_community_posts" ON community_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ===== COMMUNITY LIKES =====
CREATE TABLE IF NOT EXISTS community_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_community_likes" ON community_likes;
CREATE POLICY "select_community_likes" ON community_likes FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_community_likes" ON community_likes;
CREATE POLICY "insert_community_likes" ON community_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_community_likes" ON community_likes;
CREATE POLICY "delete_community_likes" ON community_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ===== COMMUNITY COMMENTS =====
CREATE TABLE IF NOT EXISTS community_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name text NOT NULL DEFAULT '',
  user_avatar text DEFAULT '',
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_community_comments" ON community_comments;
CREATE POLICY "select_community_comments" ON community_comments FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_community_comments" ON community_comments;
CREATE POLICY "insert_community_comments" ON community_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_community_comments" ON community_comments;
CREATE POLICY "update_community_comments" ON community_comments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_community_comments" ON community_comments;
CREATE POLICY "delete_community_comments" ON community_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ===== LEADS =====
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text DEFAULT '',
  phone text NOT NULL,
  source text DEFAULT 'admin',
  status text NOT NULL DEFAULT 'new',
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to_name text DEFAULT '',
  notes text DEFAULT '',
  call_notes text DEFAULT '',
  last_contacted_at timestamptz,
  closed_amount numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_leads" ON leads;
CREATE POLICY "select_leads" ON leads FOR SELECT TO authenticated USING (assigned_to = auth.uid() OR assigned_to IS NULL);
DROP POLICY IF EXISTS "insert_leads" ON leads;
CREATE POLICY "insert_leads" ON leads FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_leads" ON leads;
CREATE POLICY "update_leads" ON leads FOR UPDATE TO authenticated USING (assigned_to = auth.uid() OR assigned_to IS NULL) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_leads" ON leads;
CREATE POLICY "delete_leads" ON leads FOR DELETE TO authenticated USING (assigned_to = auth.uid() OR assigned_to IS NULL);

-- ===== SALES RECORDS =====
CREATE TABLE IF NOT EXISTS sales_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_name text NOT NULL DEFAULT '',
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  lead_name text NOT NULL DEFAULT '',
  amount numeric NOT NULL DEFAULT 0,
  commission numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  verified boolean NOT NULL DEFAULT false,
  verified_at timestamptz,
  week_start date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE sales_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_sales" ON sales_records;
CREATE POLICY "select_own_sales" ON sales_records FOR SELECT TO authenticated USING (auth.uid() = partner_id);
DROP POLICY IF EXISTS "insert_own_sales" ON sales_records;
CREATE POLICY "insert_own_sales" ON sales_records FOR INSERT TO authenticated WITH CHECK (auth.uid() = partner_id);
DROP POLICY IF EXISTS "update_own_sales" ON sales_records;
CREATE POLICY "update_own_sales" ON sales_records FOR UPDATE TO authenticated USING (auth.uid() = partner_id) WITH CHECK (auth.uid() = partner_id);

-- ===== SALES PARTNER CONFIG =====
CREATE TABLE IF NOT EXISTS sales_partner_config (
  id text PRIMARY KEY DEFAULT 'default',
  daily_lead_limit int NOT NULL DEFAULT 10,
  commission_per_sale numeric NOT NULL DEFAULT 100,
  weekly_payout boolean NOT NULL DEFAULT true,
  no_min_withdrawal boolean NOT NULL DEFAULT true,
  inactivity_reassign_hours int NOT NULL DEFAULT 48,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE sales_partner_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_sales_config" ON sales_partner_config;
CREATE POLICY "select_sales_config" ON sales_partner_config FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_sales_config" ON sales_partner_config;
CREATE POLICY "insert_sales_config" ON sales_partner_config FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_sales_config" ON sales_partner_config;
CREATE POLICY "update_sales_config" ON sales_partner_config FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

INSERT INTO sales_partner_config (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

-- ===== CERTIFICATES =====
CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name text NOT NULL DEFAULT '',
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  course_title text NOT NULL,
  certificate_id text NOT NULL UNIQUE,
  issued_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_certificates" ON certificates;
CREATE POLICY "select_own_certificates" ON certificates FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_certificates" ON certificates;
CREATE POLICY "insert_own_certificates" ON certificates FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_certificates" ON certificates;
CREATE POLICY "delete_own_certificates" ON certificates FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ===== CONTACT SUBMISSIONS =====
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text DEFAULT '',
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_contact_submissions" ON contact_submissions;
CREATE POLICY "select_contact_submissions" ON contact_submissions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_contact_submissions" ON contact_submissions;
CREATE POLICY "insert_contact_submissions" ON contact_submissions FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_contact_submissions" ON contact_submissions;
CREATE POLICY "update_contact_submissions" ON contact_submissions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_affiliate_user_id ON affiliate_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_likes_post ON community_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_post ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_leads_assigned ON leads(assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_sales_partner_id ON sales_records(partner_id);
CREATE INDEX IF NOT EXISTS idx_sales_week_start ON sales_records(week_start);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_submissions(created_at DESC);
