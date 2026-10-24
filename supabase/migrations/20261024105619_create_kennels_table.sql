/*
# Create kennels table

## Purpose
A kennel represents a breeder's operation — a named, optionally public
profile page that groups their dogs, listings, and breeding history.
Each breeder can own one or more kennels. The `slug` provides a clean
URL for public storefronts (e.g., /breeder/my-kennel-name).

## New Tables
- `kennels`
  - `id` (uuid, primary key)
  - `owner_id` (uuid, not null, default auth.uid()) — FK to auth.users,
    cascades on delete. Ensures inserts from the client succeed even
    when owner_id is not explicitly passed.
  - `name` (text, not null) — display name of the kennel
  - `slug` (text, not null, unique) — URL-friendly identifier
  - `description` (text, nullable) — about the kennel
  - `location` (text, nullable) — geographic location
  - `website` (text, nullable) — external website URL
  - `logo_url` (text, nullable) — kennel logo image
  - `is_public` (boolean, default false) — whether storefront is visible
  - `created_at` (timestamptz, default now)
  - `updated_at` (timestamptz, default now)

## Security
- RLS enabled on `kennels`.
- Grant SELECT, INSERT, UPDATE, DELETE to `authenticated`.
- All four CRUD policies scope to owner via auth.uid() = owner_id.
- updated_at trigger keeps the timestamp current.
- Index on owner_id for efficient lookups.
*/

CREATE TABLE IF NOT EXISTS kennels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  location text,
  website text,
  logo_url text,
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kennels_owner_id ON kennels(owner_id);

ALTER TABLE kennels ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON kennels TO authenticated;

DROP POLICY IF EXISTS "select_own_kennels" ON kennels;
CREATE POLICY "select_own_kennels" ON kennels
  FOR SELECT TO authenticated
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "insert_own_kennels" ON kennels;
CREATE POLICY "insert_own_kennels" ON kennels
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "update_own_kennels" ON kennels;
CREATE POLICY "update_own_kennels" ON kennels
  FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "delete_own_kennels" ON kennels;
CREATE POLICY "delete_own_kennels" ON kennels
  FOR DELETE TO authenticated
  USING (auth.uid() = owner_id);

DROP TRIGGER IF EXISTS kennels_updated_at ON kennels;
CREATE TRIGGER kennels_updated_at
  BEFORE UPDATE ON kennels
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
