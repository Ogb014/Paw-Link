/*
# Create dog-photos storage bucket and policies

## Purpose
Set up a private Supabase Storage bucket for dog photos. Files are stored
per-owner using a path structure: `{user_id}/{dog_id}/{filename}`. This ensures
users can only access their own photos.

## Changes
- Creates the `dog-photos` storage bucket (if not exists).
- Storage policies for SELECT, INSERT, UPDATE, DELETE:
  - Users can manage objects under their own user ID prefix.
  - Public read is NOT enabled (photos are private; URLs are signed).

## Notes
- The bucket is private. The frontend uses `supabase.storage.from('dog-photos')
  .createSignedUrl(path, expiry)` to generate time-limited URLs for display.
- Path format: `{auth.uid()}/{dog_id}/{timestamp}-{filename}`
- The RLS policies on the `dog_photos` table (database) ensure that even if
  someone has a storage path, they can only insert/update/delete metadata rows
  for dogs they own.
*/

INSERT INTO storage.buckets (id, name, public)
SELECT 'dog-photos', 'dog-photos', false
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'dog-photos');

-- Storage policies: users can manage objects under their own user ID folder
DROP POLICY IF EXISTS "dog_photos_select_own" ON storage.objects;
CREATE POLICY "dog_photos_select_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'dog-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "dog_photos_insert_own" ON storage.objects;
CREATE POLICY "dog_photos_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'dog-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "dog_photos_update_own" ON storage.objects;
CREATE POLICY "dog_photos_update_own" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'dog-photos' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'dog-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "dog_photos_delete_own" ON storage.objects;
CREATE POLICY "dog_photos_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'dog-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
