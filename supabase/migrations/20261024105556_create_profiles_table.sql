/*
# Create profiles table

## Purpose
Stores user profile information linked to Supabase Auth. Each authenticated
user gets exactly one profile row, created at signup. The profile holds the
user's role (breeder / buyer / service_seeker), display name, avatar, and
other public-facing metadata.

## New Tables
- `profiles`
  - `id` (uuid, primary key) — matches the user's id in auth.users
  - `email` (text, not null) — copied from auth email for convenience
  - `full_name` (text, nullable) — display name shown across the app
  - `role` (text, nullable) — one of 'breeder', 'buyer', 'service_seeker'
  - `avatar_url` (text, nullable) — profile image URL
  - `phone` (text, nullable) — contact phone number
  - `location` (text, nullable) — general location string (city/state/country)
  - `bio` (text, nullable) — free-form biography
  - `created_at` (timestamptz, default now)
  - `updated_at` (timestamptz, default now)

## Security
- RLS enabled on `profiles`.
- Grant SELECT, INSERT, UPDATE to `authenticated` only (app requires sign-in).
- SELECT policy: users can read their own profile only.
- INSERT policy: users can insert their own profile only (id = auth.uid()).
- UPDATE policy: users can update their own profile only.
- No DELETE policy (profiles are not deleted from the frontend).
- Added a CHECK constraint on `role` to ensure only valid role values.
- An `updated_at` trigger keeps the timestamp current on every UPDATE.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text CHECK (role IN ('breeder', 'buyer', 'service_seeker')),
  avatar_url text,
  phone text,
  location text,
  bio text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
