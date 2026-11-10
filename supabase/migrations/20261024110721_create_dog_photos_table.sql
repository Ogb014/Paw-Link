/*
# Create dog_photos table

## Purpose
Stores metadata for each photo uploaded for a dog. The actual image files live
in Supabase Storage (bucket: dog-photos). This table tracks the storage path,
display order, and which photo is the primary profile image.

## New Tables
- `dog_photos`
  - `id` (uuid, primary key)
  - `dog_id` (uuid, not null) — FK to dogs, cascades on delete
  - `storage_path` (text, not null) — path within the dog-photos bucket
  - `url` (text, not null) — public/signed URL for display
  - `is_primary` (boolean, default false) — marks the profile photo
  - `sort_order` (int, default 0) — display ordering
  - `created_at` (timestamptz, default now)

## Security
- RLS enabled on `dog_photos`.
- Grant SELECT, INSERT, UPDATE, DELETE to `authenticated`.
- All four CRUD policies scope through dog → kennel ownership:
  EXISTS (SELECT 1 FROM dogs d JOIN kennels k ON k.id = d.kennel_id
  WHERE d.id = dog_photos.dog_id AND k.owner_id = auth.uid())
- Index on dog_id for efficient lookups.
*/

CREATE TABLE IF NOT EXISTS dog_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id uuid NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  url text NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dog_photos_dog_id ON dog_photos(dog_id);

ALTER TABLE dog_photos ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON dog_photos TO authenticated;

DROP POLICY IF EXISTS "select_own_dog_photos" ON dog_photos;
CREATE POLICY "select_own_dog_photos" ON dog_photos
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dogs d
      JOIN kennels k ON k.id = d.kennel_id
      WHERE d.id = dog_photos.dog_id AND k.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_own_dog_photos" ON dog_photos;
CREATE POLICY "insert_own_dog_photos" ON dog_photos
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dogs d
      JOIN kennels k ON k.id = d.kennel_id
      WHERE d.id = dog_photos.dog_id AND k.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_own_dog_photos" ON dog_photos;
CREATE POLICY "update_own_dog_photos" ON dog_photos
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dogs d
      JOIN kennels k ON k.id = d.kennel_id
      WHERE d.id = dog_photos.dog_id AND k.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dogs d
      JOIN kennels k ON k.id = d.kennel_id
      WHERE d.id = dog_photos.dog_id AND k.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_own_dog_photos" ON dog_photos;
CREATE POLICY "delete_own_dog_photos" ON dog_photos
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dogs d
      JOIN kennels k ON k.id = d.kennel_id
      WHERE d.id = dog_photos.dog_id AND k.owner_id = auth.uid()
    )
  );
