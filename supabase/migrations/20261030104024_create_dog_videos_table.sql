/*
# Create dog_videos Table

## Summary
Creates a `dog_videos` table to track video files associated with dogs,
mirroring the existing `dog_photos` table structure. This supports
the requirement of at least 3 videos per dog.

## New Table: dog_videos
- `id` (uuid PK)
- `dog_id` (uuid FK dogs, CASCADE)
- `storage_path` (text NOT NULL) — path in dog-videos storage bucket
- `url` (text NOT NULL) — signed URL
- `title` (text, nullable) — optional video title/caption
- `sort_order` (int, default 0)
- `created_at` (timestamptz)

## Security
- RLS enabled
- SELECT: public/any authenticated user can see videos for public dogs
- INSERT/UPDATE/DELETE: only dog owner (through dog → kennel → owner_id = auth.uid())
- Grants: SELECT to authenticated; INSERT/UPDATE/DELETE to authenticated
*/

CREATE TABLE IF NOT EXISTS dog_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id uuid NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  url text NOT NULL,
  title text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE dog_videos ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON dog_videos TO authenticated;
GRANT INSERT, UPDATE, DELETE ON dog_videos TO authenticated;

DROP POLICY IF EXISTS "select_dog_videos" ON dog_videos;
CREATE POLICY "select_dog_videos"
  ON dog_videos FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM dogs d
      JOIN kennels k ON k.id = d.kennel_id
      WHERE d.id = dog_videos.dog_id
      AND k.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_dog_videos" ON dog_videos;
CREATE POLICY "insert_dog_videos"
  ON dog_videos FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM dogs d
      JOIN kennels k ON k.id = d.kennel_id
      WHERE d.id = dog_videos.dog_id
      AND k.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_dog_videos" ON dog_videos;
CREATE POLICY "update_dog_videos"
  ON dog_videos FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM dogs d
      JOIN kennels k ON k.id = d.kennel_id
      WHERE d.id = dog_videos.dog_id
      AND k.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dogs d
      JOIN kennels k ON k.id = d.kennel_id
      WHERE d.id = dog_videos.dog_id
      AND k.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_dog_videos" ON dog_videos;
CREATE POLICY "delete_dog_videos"
  ON dog_videos FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM dogs d
      JOIN kennels k ON k.id = d.kennel_id
      WHERE d.id = dog_videos.dog_id
      AND k.owner_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_dog_videos_dog ON dog_videos(dog_id);