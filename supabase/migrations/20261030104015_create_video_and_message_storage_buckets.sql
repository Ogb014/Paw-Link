/*
# Create Storage Buckets for Dog Videos and Message Media

## Summary
This migration creates two new private storage buckets:
1. `dog-videos` — for video files uploaded as part of dog profiles (breeder-controlled)
2. `message-media` — for photos and videos shared in in-app messages between breeders and buyers

## Security

### dog-videos bucket
- Private bucket (not public)
- Upload/Update/Delete: only the dog owner (verified through path-based ownership)
- Read: only the dog owner (signed URLs required)
- Path pattern: `{user_id}/{dog_id}/{filename}`

### message-media bucket
- Private bucket (not public)
- Upload/Read/Delete: only the uploader (path-based ownership)
- Path pattern: `{user_id}/{conversation_id}/{filename}`
*/

-- ============================================================
-- 1. dog-videos bucket
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('dog-videos', 'dog-videos', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "dog_videos_upload_owner" ON storage.objects;
CREATE POLICY "dog_videos_upload_owner"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'dog-videos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "dog_videos_read_owner" ON storage.objects;
CREATE POLICY "dog_videos_read_owner"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'dog-videos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "dog_videos_update_owner" ON storage.objects;
CREATE POLICY "dog_videos_update_owner"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'dog-videos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'dog-videos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "dog_videos_delete_owner" ON storage.objects;
CREATE POLICY "dog_videos_delete_owner"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'dog-videos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- 2. message-media bucket
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-media', 'message-media', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "message_media_upload_owner" ON storage.objects;
CREATE POLICY "message_media_upload_owner"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'message-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "message_media_read_owner" ON storage.objects;
CREATE POLICY "message_media_read_owner"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'message-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "message_media_delete_owner" ON storage.objects;
CREATE POLICY "message_media_delete_owner"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'message-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );