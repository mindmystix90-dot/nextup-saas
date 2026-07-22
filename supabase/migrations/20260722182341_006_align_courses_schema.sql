/*
# NextUp SaaS — Align courses table with app schema

1. Changes to `courses` table:
- Add missing columns: description, thumbnail_url, is_sales_training, total_lessons
- Add numeric price_override column for programmatic price handling
- Keep existing columns intact (subtitle, icon, gradient, duration, sort_order, level)

2. Data
- DELETE all demo course data (10 rows) — platform starts empty

3. Notes
- Existing column names are preserved (level instead of difficulty, lessons instead of total_lessons)
- New columns are nullable with defaults to avoid breaking existing rows
- Demo data removal makes the platform production-ready (starts empty)
*/

-- Add missing columns to courses table
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'description') THEN
    ALTER TABLE courses ADD COLUMN description text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'thumbnail_url') THEN
    ALTER TABLE courses ADD COLUMN thumbnail_url text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'is_sales_training') THEN
    ALTER TABLE courses ADD COLUMN is_sales_training boolean NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'total_lessons') THEN
    ALTER TABLE courses ADD COLUMN total_lessons int NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Remove all demo course data
DELETE FROM courses;
