/*
# Create Marketplace Tables: Ratings, Messaging, Dashboard Config

## Summary
This migration adds the core marketplace features to Paw Link:
1. Breeder ratings (1-5 stars) by buyers
2. In-app messaging system (conversations, messages, message attachments)
3. Breeder dashboard customization config
4. Contact fields on kennels for external communication

## New Tables

### breeder_ratings
- Allows buyers to rate breeders with a 1-5 star rating and optional review text
- `id` (uuid PK)
- `breeder_id` (uuid FK profiles) — the breeder being rated
- `buyer_id` (uuid FK profiles) — the buyer who wrote the rating
- `rating` (int 1-5, NOT NULL) — star rating
- `review` (text, nullable) — optional review text
- `created_at`, `updated_at` (timestamptz)
- UNIQUE constraint on (breeder_id, buyer_id) — one rating per buyer per breeder

### conversations
- 1:1 conversation between a buyer and a breeder
- `id` (uuid PK)
- `breeder_id` (uuid FK profiles) — the breeder
- `buyer_id` (uuid FK profiles) — the buyer
- `kennel_id` (uuid FK kennels, nullable) — optional kennel context
- `created_at`, `updated_at` (timestamptz)
- UNIQUE constraint on (breeder_id, buyer_id) — one conversation per pair

### messages
- Individual messages within a conversation
- `id` (uuid PK)
- `conversation_id` (uuid FK conversations, CASCADE)
- `sender_id` (uuid FK profiles) — who sent the message
- `content` (text, nullable) — message text (nullable when only media)
- `created_at` (timestamptz)

### message_attachments
- Media files (photos/videos) attached to messages
- `id` (uuid PK)
- `message_id` (uuid FK messages, CASCADE)
- `storage_path` (text NOT NULL) — path in message-media bucket
- `url` (text NOT NULL) — signed URL
- `media_type` (text NOT NULL, CHECK photo|video)
- `created_at` (timestamptz)

### breeder_dashboard_configs
- Customizable dashboard widget layout for breeders
- `id` (uuid PK)
- `breeder_id` (uuid FK profiles, UNIQUE)
- `widgets` (jsonb NOT NULL DEFAULT '[]') — array of widget configs
- `layout` (jsonb NOT NULL DEFAULT '{}') — layout preferences
- `created_at`, `updated_at` (timestamptz)

## Modified Tables

### kennels
- Added `phone` (text, nullable) — phone number for external contact
- Added `email` (text, nullable) — public contact email
- Added `external_link` (text, nullable) — external website/social link

## Security

### breeder_ratings
- RLS enabled
- SELECT: any authenticated user can see ratings (public marketplace data)
- INSERT/UPDATE/DELETE: only the buyer who wrote the rating (buyer_id = auth.uid())
- Grants: SELECT to authenticated; INSERT/UPDATE/DELETE to authenticated

### conversations
- RLS enabled
- All CRUD: only participants (breeder_id = auth.uid() OR buyer_id = auth.uid())
- Grants: CRUD to authenticated

### messages
- RLS enabled
- SELECT/INSERT: conversation participants
- UPDATE/DELETE: sender only
- Grants: CRUD to authenticated

### message_attachments
- RLS enabled
- SELECT: conversation participants (through message → conversation)
- INSERT: message sender (through message → conversation, sender_id = auth.uid())
- DELETE: message sender
- Grants: SELECT/INSERT/DELETE to authenticated

### breeder_dashboard_configs
- RLS enabled
- All CRUD: breeder only (breeder_id = auth.uid())
- Grants: CRUD to authenticated
*/

-- ============================================================
-- 1. Add contact fields to kennels
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kennels' AND column_name = 'phone') THEN
    ALTER TABLE kennels ADD COLUMN phone text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kennels' AND column_name = 'email') THEN
    ALTER TABLE kennels ADD COLUMN email text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kennels' AND column_name = 'external_link') THEN
    ALTER TABLE kennels ADD COLUMN external_link text;
  END IF;
END $$;

-- ============================================================
-- 2. breeder_ratings
-- ============================================================
CREATE TABLE IF NOT EXISTS breeder_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  breeder_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (breeder_id, buyer_id)
);

ALTER TABLE breeder_ratings ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON breeder_ratings TO authenticated;
GRANT INSERT, UPDATE, DELETE ON breeder_ratings TO authenticated;

DROP POLICY IF EXISTS "select_breeder_ratings" ON breeder_ratings;
CREATE POLICY "select_breeder_ratings"
  ON breeder_ratings FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_breeder_rating" ON breeder_ratings;
CREATE POLICY "insert_own_breeder_rating"
  ON breeder_ratings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "update_own_breeder_rating" ON breeder_ratings;
CREATE POLICY "update_own_breeder_rating"
  ON breeder_ratings FOR UPDATE
  TO authenticated USING (auth.uid() = buyer_id) WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "delete_own_breeder_rating" ON breeder_ratings;
CREATE POLICY "delete_own_breeder_rating"
  ON breeder_ratings FOR DELETE
  TO authenticated USING (auth.uid() = buyer_id);

-- ============================================================
-- 3. conversations
-- ============================================================
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  breeder_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  kennel_id uuid REFERENCES kennels(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (breeder_id, buyer_id)
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON conversations TO authenticated;

DROP POLICY IF EXISTS "select_own_conversations" ON conversations;
CREATE POLICY "select_own_conversations"
  ON conversations FOR SELECT
  TO authenticated USING (auth.uid() = breeder_id OR auth.uid() = buyer_id);

DROP POLICY IF EXISTS "insert_own_conversations" ON conversations;
CREATE POLICY "insert_own_conversations"
  ON conversations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = breeder_id OR auth.uid() = buyer_id);

DROP POLICY IF EXISTS "update_own_conversations" ON conversations;
CREATE POLICY "update_own_conversations"
  ON conversations FOR UPDATE
  TO authenticated USING (auth.uid() = breeder_id OR auth.uid() = buyer_id)
  WITH CHECK (auth.uid() = breeder_id OR auth.uid() = buyer_id);

DROP POLICY IF EXISTS "delete_own_conversations" ON conversations;
CREATE POLICY "delete_own_conversations"
  ON conversations FOR DELETE
  TO authenticated USING (auth.uid() = breeder_id OR auth.uid() = buyer_id);

-- ============================================================
-- 4. messages
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON messages TO authenticated;

DROP POLICY IF EXISTS "select_conversation_messages" ON messages;
CREATE POLICY "select_conversation_messages"
  ON messages FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.breeder_id = auth.uid() OR c.buyer_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "insert_conversation_messages" ON messages;
CREATE POLICY "insert_conversation_messages"
  ON messages FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.breeder_id = auth.uid() OR c.buyer_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "update_own_messages" ON messages;
CREATE POLICY "update_own_messages"
  ON messages FOR UPDATE
  TO authenticated USING (auth.uid() = sender_id) WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "delete_own_messages" ON messages;
CREATE POLICY "delete_own_messages"
  ON messages FOR DELETE
  TO authenticated USING (auth.uid() = sender_id);

-- ============================================================
-- 5. message_attachments
-- ============================================================
CREATE TABLE IF NOT EXISTS message_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  url text NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('photo', 'video')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, DELETE ON message_attachments TO authenticated;

DROP POLICY IF EXISTS "select_conversation_attachments" ON message_attachments;
CREATE POLICY "select_conversation_attachments"
  ON message_attachments FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = message_attachments.message_id
      AND (c.breeder_id = auth.uid() OR c.buyer_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "insert_conversation_attachments" ON message_attachments;
CREATE POLICY "insert_conversation_attachments"
  ON message_attachments FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = message_attachments.message_id
      AND m.sender_id = auth.uid()
      AND (c.breeder_id = auth.uid() OR c.buyer_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "delete_own_attachments" ON message_attachments;
CREATE POLICY "delete_own_attachments"
  ON message_attachments FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM messages m
      WHERE m.id = message_attachments.message_id
      AND m.sender_id = auth.uid()
    )
  );

-- ============================================================
-- 6. breeder_dashboard_configs
-- ============================================================
CREATE TABLE IF NOT EXISTS breeder_dashboard_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  breeder_id uuid NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  widgets jsonb NOT NULL DEFAULT '[]'::jsonb,
  layout jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE breeder_dashboard_configs ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON breeder_dashboard_configs TO authenticated;

DROP POLICY IF EXISTS "select_own_dashboard_config" ON breeder_dashboard_configs;
CREATE POLICY "select_own_dashboard_config"
  ON breeder_dashboard_configs FOR SELECT
  TO authenticated USING (auth.uid() = breeder_id);

DROP POLICY IF EXISTS "insert_own_dashboard_config" ON breeder_dashboard_configs;
CREATE POLICY "insert_own_dashboard_config"
  ON breeder_dashboard_configs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = breeder_id);

DROP POLICY IF EXISTS "update_own_dashboard_config" ON breeder_dashboard_configs;
CREATE POLICY "update_own_dashboard_config"
  ON breeder_dashboard_configs FOR UPDATE
  TO authenticated USING (auth.uid() = breeder_id) WITH CHECK (auth.uid() = breeder_id);

DROP POLICY IF EXISTS "delete_own_dashboard_config" ON breeder_dashboard_configs;
CREATE POLICY "delete_own_dashboard_config"
  ON breeder_dashboard_configs FOR DELETE
  TO authenticated USING (auth.uid() = breeder_id);

-- ============================================================
-- 7. Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_breeder_ratings_breeder ON breeder_ratings(breeder_id);
CREATE INDEX IF NOT EXISTS idx_conversations_breeder ON conversations(breeder_id);
CREATE INDEX IF NOT EXISTS idx_conversations_buyer ON conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_message_attachments_message ON message_attachments(message_id);