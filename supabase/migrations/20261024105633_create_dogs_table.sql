/*
# Create dogs table

## Purpose
The core entity of Paw Link — a dog profile within a kennel. Stores
detailed information about each dog including breed, physical traits,
identification, health status, and marketplace listing settings.
Supports unlimited dogs per kennel (within platform limits).

## New Tables
- `dogs`
  - `id` (uuid, primary key)
  - `kennel_id` (uuid, not null) — FK to kennels, cascades on delete
  - `name` (text, not null) — dog's name
  - `breed` (text, not null) — breed name
  - `sex` (text, nullable) — 'male' or 'female'
  - `date_of_birth` (date, nullable)
  - `color` (text, nullable) — coat color
  - `weight_kg` (numeric, nullable)
  - `height_cm` (numeric, nullable)
  - `microchip_number` (text, nullable)
  - `registration_number` (text, nullable) — pedigree/club registration
  - `status` (text, nullable) — e.g., 'available', 'reserved', 'sold', 'retired'
  - `is_listed` (boolean, default false) — shown in marketplace
  - `listing_type` (text, nullable) — e.g., 'sale', 'stud', 'service'
  - `listing_price` (numeric, nullable)
  - `bio` (text, nullable) — description for marketplace listing
  - `profile_photo_url` (text, nullable) — primary photo URL
  - `photos` (jsonb, nullable) — array of additional photo URLs
  - `custom_fields` (jsonb, nullable) — user-defined key-value pairs
  - `created_at` (timestamptz, default now)
  - `updated_at` (timestamptz, default now)

## Security
- RLS enabled on `dogs`.
- Grant SELECT, INSERT, UPDATE, DELETE to `authenticated`.
- All four CRUD policies scope through kennel ownership:
  EXISTS (SELECT 1 FROM kennels WHERE kennels.id = dogs.kennel_id
  AND kennels.owner_id = auth.uid()).
- updated_at trigger keeps the timestamp current.
- Index on kennel_id for efficient joins and lookups.
- Index on is_listed for marketplace queries.
- CHECK constraint on sex ensures only valid values.
*/

CREATE TABLE IF NOT EXISTS dogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kennel_id uuid NOT NULL REFERENCES kennels(id) ON DELETE CASCADE,
  name text NOT NULL,
  breed text NOT NULL,
  sex text CHECK (sex IN ('male', 'female')),
  date_of_birth date,
  color text,
  weight_kg numeric,
  height_cm numeric,
  microchip_number text,
  registration_number text,
  status text,
  is_listed boolean NOT NULL DEFAULT false,
  listing_type text,
  listing_price numeric,
  bio text,
  profile_photo_url text,
  photos jsonb DEFAULT '[]'::jsonb,
  custom_fields jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dogs_kennel_id ON dogs(kennel_id);
CREATE INDEX IF NOT EXISTS idx_dogs_is_listed ON dogs(is_listed) WHERE is_listed = true;

ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON dogs TO authenticated;

DROP POLICY IF EXISTS "select_own_dogs" ON dogs;
CREATE POLICY "select_own_dogs" ON dogs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM kennels
      WHERE kennels.id = dogs.kennel_id
      AND kennels.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_own_dogs" ON dogs;
CREATE POLICY "insert_own_dogs" ON dogs
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM kennels
      WHERE kennels.id = dogs.kennel_id
      AND kennels.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_own_dogs" ON dogs;
CREATE POLICY "update_own_dogs" ON dogs
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM kennels
      WHERE kennels.id = dogs.kennel_id
      AND kennels.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM kennels
      WHERE kennels.id = dogs.kennel_id
      AND kennels.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_own_dogs" ON dogs;
CREATE POLICY "delete_own_dogs" ON dogs
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM kennels
      WHERE kennels.id = dogs.kennel_id
      AND kennels.owner_id = auth.uid()
    )
  );

DROP TRIGGER IF EXISTS dogs_updated_at ON dogs;
CREATE TRIGGER dogs_updated_at
  BEFORE UPDATE ON dogs
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
