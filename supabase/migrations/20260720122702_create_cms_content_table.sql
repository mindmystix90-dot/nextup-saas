/*
# Create cms_content table (single-row key-value store for website CMS)

1. New Tables
- `cms_content` — stores editable website content (hero, stats, footer, contact, company).
  - `id` (int, primary key, always 1 — single-row table)
  - `hero` (jsonb: eyebrow, titleLine1-3, subtitle, primaryCta, secondaryCta)
  - `stats` (jsonb: array of {label, value, suffix, icon})
  - `footer` (jsonb: description, email, phone, address)
  - `contact` (jsonb: email, phone, address, hours)
  - `company` (jsonb: name, tagline, founded, legalName, gstin)
  - `updated_at` (timestamptz)

2. Security
- Enable RLS on `cms_content`.
- Allow anon + authenticated full CRUD because CMS content is public/shared
  and the admin route is protected by Firebase auth at the app layer.
*/

CREATE TABLE IF NOT EXISTS cms_content (
  id int PRIMARY KEY DEFAULT 1,
  hero jsonb DEFAULT '{}'::jsonb,
  stats jsonb DEFAULT '[]'::jsonb,
  footer jsonb DEFAULT '{}'::jsonb,
  contact jsonb DEFAULT '{}'::jsonb,
  company jsonb DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE cms_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_cms" ON cms_content;
CREATE POLICY "anon_select_cms" ON cms_content FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_cms" ON cms_content;
CREATE POLICY "anon_insert_cms" ON cms_content FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_cms" ON cms_content;
CREATE POLICY "anon_update_cms" ON cms_content FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_cms" ON cms_content;
CREATE POLICY "anon_delete_cms" ON cms_content FOR DELETE
  TO anon, authenticated USING (true);
