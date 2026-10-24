/*
# Fix handle_updated_at search_path

## Purpose
The database security advisor flagged that the `handle_updated_at` trigger
function has a mutable search_path, which could allow search_path hijacking.
This migration recreates the function with an explicit, fixed search_path.

## Changes
- Drops and recreates `handle_updated_at` with `SET search_path = public, pg_temp`.
- Recreates triggers on profiles, kennels, and dogs that reference the function.
*/

-- Drop triggers first (they depend on the function)
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS kennels_updated_at ON kennels;
DROP TRIGGER IF EXISTS dogs_updated_at ON dogs;

-- Recreate function with fixed search_path
DROP FUNCTION IF EXISTS handle_updated_at();

CREATE FUNCTION handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER kennels_updated_at
  BEFORE UPDATE ON kennels
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER dogs_updated_at
  BEFORE UPDATE ON dogs
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
