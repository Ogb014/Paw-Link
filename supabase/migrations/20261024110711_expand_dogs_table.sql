/*
# Expand dogs table for full profile support

## Purpose
The original dogs table had basic fields. This migration adds the columns
needed for comprehensive dog profiles: call name, acquisition info, sire/dam
references, temperament notes, availability flags (sale/breeding separate from
marketplace listing), public visibility, and more.

## Changes to existing `dogs` table (all ADD COLUMN — non-destructive)
- `call_name` (text, nullable) — everyday name separate from registered name
- `breed_secondary` (text, nullable) — second breed for mixed breeds
- `estimated_age` (text, nullable) — free-text age estimate when DOB unknown
- `markings` (text, nullable) — distinctive markings
- `acquisition_date` (date, nullable) — when the dog was acquired
- `acquisition_source` (text, nullable) — where the dog came from
- `sire_id` (uuid, nullable, self-FK) — father (references dogs.id)
- `dam_id` (uuid, nullable, self-FK) — mother (references dogs.id)
- `pedigree_info` (text, nullable) — pedigree/lineage notes
- `temperament_notes` (text, nullable)
- `training_notes` (text, nullable)
- `socialisation_notes` (text, nullable)
- `internal_notes` (text, nullable) — private notes for the breeder
- `available_for_sale` (boolean, default false) — separate from is_listed
- `available_for_breeding` (boolean, default false)
- `is_archived` (boolean, default false) — soft archive
- `is_public` (boolean, default true) — public profile visibility
- `sale_price` (numeric, nullable) — asking price when available for sale
- `breeding_fee` (numeric, nullable) — stud fee when available for breeding

## Security
- No changes to existing RLS policies (still scoped through kennel ownership).
- No changes to grants.
- Self-referencing FKs (sire_id, dam_id) are nullable and don't affect policies.

## Notes
- `is_listed` and `listing_type`/`listing_price` remain for future marketplace
  phase. `available_for_sale` / `available_for_breeding` are the breeder-side
  flags that control whether a dog CAN be listed — publishing is separate.
- `status` column already exists; we add a CHECK constraint to limit values.
*/

ALTER TABLE dogs ADD COLUMN IF NOT EXISTS call_name text;
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS breed_secondary text;
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS estimated_age text;
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS markings text;
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS acquisition_date date;
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS acquisition_source text;
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS sire_id uuid REFERENCES dogs(id) ON DELETE SET NULL;
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS dam_id uuid REFERENCES dogs(id) ON DELETE SET NULL;
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS pedigree_info text;
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS temperament_notes text;
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS training_notes text;
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS socialisation_notes text;
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS internal_notes text;
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS available_for_sale boolean NOT NULL DEFAULT false;
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS available_for_breeding boolean NOT NULL DEFAULT false;
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true;
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS sale_price numeric;
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS breeding_fee numeric;

-- Add CHECK constraint on status (drop first for idempotency)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'dogs_status_check'
  ) THEN
    ALTER TABLE dogs ADD CONSTRAINT dogs_status_check
      CHECK (status IS NULL OR status IN ('active', 'inactive', 'deceased', 'archived'));
  END IF;
END $$;

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_dogs_sire_id ON dogs(sire_id) WHERE sire_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_dogs_dam_id ON dogs(dam_id) WHERE dam_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_dogs_available_for_sale ON dogs(available_for_sale) WHERE available_for_sale = true;
CREATE INDEX IF NOT EXISTS idx_dogs_available_for_breeding ON dogs(available_for_breeding) WHERE available_for_breeding = true;
CREATE INDEX IF NOT EXISTS idx_dogs_is_archived ON dogs(is_archived) WHERE is_archived = false;
