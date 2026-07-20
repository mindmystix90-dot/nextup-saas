/*
# Create courses table

1. New Tables
- `courses` — stores the course catalogue managed by admins.
  - `id` (uuid, primary key)
  - `title` (text, not null)
  - `subtitle` (text, short description)
  - `instructor` (text, not null)
  - `category` (text, not null)
  - `level` (text: Beginner | Intermediate | Advanced)
  - `price` (text, display string e.g. "₹2,499")
  - `icon` (text, lucide icon name)
  - `gradient` (text, tailwind gradient classes)
  - `lessons` (int, lesson count)
  - `duration` (text, display string e.g. "12 hours")
  - `status` (text: Published | Draft, default Published)
  - `sort_order` (int, default 0)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

2. Security
- Enable RLS on `courses`.
- Allow anon + authenticated full CRUD because course data is public/shared
  and the admin route is protected by Firebase auth at the app layer.
*/

CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text DEFAULT '',
  instructor text NOT NULL,
  category text NOT NULL,
  level text NOT NULL DEFAULT 'Beginner',
  price text DEFAULT '₹0',
  icon text DEFAULT 'BookOpen',
  gradient text DEFAULT 'from-blue-500 to-cyan-400',
  lessons int DEFAULT 0,
  duration text DEFAULT '',
  status text NOT NULL DEFAULT 'Published',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_courses" ON courses;
CREATE POLICY "anon_select_courses" ON courses FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_courses" ON courses;
CREATE POLICY "anon_insert_courses" ON courses FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_courses" ON courses;
CREATE POLICY "anon_update_courses" ON courses FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_courses" ON courses;
CREATE POLICY "anon_delete_courses" ON courses FOR DELETE
  TO anon, authenticated USING (true);
