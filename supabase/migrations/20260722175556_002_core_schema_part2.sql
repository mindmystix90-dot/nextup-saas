/*
# NextUp SaaS — Core Schema (Part 2: Courses, Lessons, Progress, KYC, Withdrawals, Payments, Pricing)

1. New Tables
- `courses` — course catalog (title, description, price, status, thumbnail, category, difficulty)
- `lessons` — lessons within courses (title, content, video_url, pdf_url, zip_url, duration, order)
- `course_access` — which courses a user has access to (purchased or membership-based)
- `course_progress` — per-user lesson completion tracking
- `kyc` — KYC verification (account holder, bank, account number, IFSC, UPI, status)
- `withdrawals` — withdrawal requests (amount, method, status, admin notes)
- `payments` — payment records (membership/course purchases, refunds)
- `pricing_plans` — membership pricing tiers

2. Security
- RLS enabled on all tables
- Owner-scoped policies for user-specific tables (course_access, course_progress, kyc, withdrawals)
- Courses and lessons readable by all authenticated users
- Payments readable by owner only

3. Notes
- course_access tracks both purchased and membership-granted courses
- course_progress tracks lesson-level completion
*/

-- ===== COURSES =====
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  category text DEFAULT '',
  difficulty text DEFAULT 'beginner',
  thumbnail_url text DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  is_sales_training boolean NOT NULL DEFAULT false,
  instructor text DEFAULT '',
  total_lessons int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_courses" ON courses;
CREATE POLICY "select_courses" ON courses FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_courses" ON courses;
CREATE POLICY "insert_courses" ON courses FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_courses" ON courses;
CREATE POLICY "update_courses" ON courses FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_courses" ON courses;
CREATE POLICY "delete_courses" ON courses FOR DELETE TO authenticated USING (true);

-- ===== LESSONS =====
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text DEFAULT '',
  video_url text DEFAULT '',
  pdf_url text DEFAULT '',
  zip_url text DEFAULT '',
  duration int NOT NULL DEFAULT 0,
  lesson_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_lessons" ON lessons;
CREATE POLICY "select_lessons" ON lessons FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_lessons" ON lessons;
CREATE POLICY "insert_lessons" ON lessons FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_lessons" ON lessons;
CREATE POLICY "update_lessons" ON lessons FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_lessons" ON lessons;
CREATE POLICY "delete_lessons" ON lessons FOR DELETE TO authenticated USING (true);

-- ===== COURSE ACCESS =====
CREATE TABLE IF NOT EXISTS course_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  access_type text NOT NULL DEFAULT 'membership',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);
ALTER TABLE course_access ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_course_access" ON course_access;
CREATE POLICY "select_own_course_access" ON course_access FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_course_access" ON course_access;
CREATE POLICY "insert_own_course_access" ON course_access FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_course_access" ON course_access;
CREATE POLICY "delete_own_course_access" ON course_access FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ===== COURSE PROGRESS =====
CREATE TABLE IF NOT EXISTS course_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_progress" ON course_progress;
CREATE POLICY "select_own_progress" ON course_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_progress" ON course_progress;
CREATE POLICY "insert_own_progress" ON course_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_progress" ON course_progress;
CREATE POLICY "update_own_progress" ON course_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ===== KYC =====
CREATE TABLE IF NOT EXISTS kyc (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  account_holder text NOT NULL DEFAULT '',
  bank_name text NOT NULL DEFAULT '',
  account_number text NOT NULL DEFAULT '',
  ifsc text NOT NULL DEFAULT '',
  upi_id text DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  rejection_reason text DEFAULT '',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);
ALTER TABLE kyc ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_kyc" ON kyc;
CREATE POLICY "select_own_kyc" ON kyc FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_kyc" ON kyc;
CREATE POLICY "insert_own_kyc" ON kyc FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_kyc" ON kyc;
CREATE POLICY "update_own_kyc" ON kyc FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ===== WITHDRAWALS =====
CREATE TABLE IF NOT EXISTS withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name text NOT NULL DEFAULT '',
  user_email text NOT NULL DEFAULT '',
  amount numeric NOT NULL DEFAULT 0,
  method text NOT NULL DEFAULT 'upi',
  status text NOT NULL DEFAULT 'pending',
  admin_note text DEFAULT '',
  upi_id text DEFAULT '',
  bank_name text DEFAULT '',
  account_number text DEFAULT '',
  ifsc text DEFAULT '',
  account_holder text DEFAULT '',
  requested_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_withdrawals" ON withdrawals;
CREATE POLICY "select_own_withdrawals" ON withdrawals FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_withdrawals" ON withdrawals;
CREATE POLICY "insert_own_withdrawals" ON withdrawals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_withdrawals" ON withdrawals;
CREATE POLICY "update_own_withdrawals" ON withdrawals FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ===== PAYMENTS =====
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name text NOT NULL DEFAULT '',
  user_email text NOT NULL DEFAULT '',
  type text NOT NULL,
  item_name text NOT NULL,
  item_id text DEFAULT '',
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  method text NOT NULL DEFAULT 'manual',
  invoice_id text DEFAULT '',
  refund_amount numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_payments" ON payments;
CREATE POLICY "select_own_payments" ON payments FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_payments" ON payments;
CREATE POLICY "insert_own_payments" ON payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_payments" ON payments;
CREATE POLICY "update_own_payments" ON payments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ===== PRICING PLANS =====
CREATE TABLE IF NOT EXISTS pricing_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  period text NOT NULL DEFAULT 'month',
  description text DEFAULT '',
  features text[] NOT NULL DEFAULT '{}',
  cta text NOT NULL DEFAULT 'Get Started',
  featured boolean NOT NULL DEFAULT false,
  badge text DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_pricing_plans" ON pricing_plans;
CREATE POLICY "select_pricing_plans" ON pricing_plans FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_pricing_plans" ON pricing_plans;
CREATE POLICY "insert_pricing_plans" ON pricing_plans FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_pricing_plans" ON pricing_plans;
CREATE POLICY "update_pricing_plans" ON pricing_plans FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_pricing_plans" ON pricing_plans;
CREATE POLICY "delete_pricing_plans" ON pricing_plans FOR DELETE TO authenticated USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_course_access_user ON course_access(user_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_user ON course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_user_id ON kyc(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pricing_active ON pricing_plans(active, sort_order);
