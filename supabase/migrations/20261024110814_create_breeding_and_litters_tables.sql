/*
# Create breeding_records and litters tables

## Purpose
Track breeding activity for dogs. breeding_records captures individual
breeding events (heat cycles, matings, pregnancies). litters captures the
outcome — a set of puppies born from a specific breeding event.

## New Tables

### breeding_records
  - `id` (uuid, primary key)
  - `dog_id` (uuid, not null) — FK to dogs (the dam/female), cascades on delete
  - `sire_id` (uuid, nullable) — FK to dogs (the sire/male), SET NULL on delete
  - `record_type` (text, not null) — 'heat_cycle', 'mating', 'pregnancy'
  - `record_date` (date, not null) — date of the event
  - `expected_whelping_date` (date, nullable) — estimated due date
  - `actual_whelping_date` (date, nullable) — confirmed birth date
  - `status` (text, not null, default 'observed') — 'observed', 'planned',
    'mated', 'confirmed_pregnant', 'whelped', 'unsuccessful'
  - `veterinary_confirmation` (boolean, default false)
  - `notes` (text, nullable)
  - `litter_id` (uuid, nullable) — FK to litters, link to resulting litter (added after litters created)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

### litters
  - `id` (uuid, primary key)
  - `kennel_id` (uuid, not null) — FK to kennels, cascades on delete
  - `name` (text, nullable) — litter identifier/name
  - `sire_id` (uuid, nullable) — FK to dogs
  - `dam_id` (uuid, nullable) — FK to dogs
  - `breeding_record_id` (uuid, nullable) — FK to breeding_records
  - `mating_date` (date, nullable)
  - `birth_date` (date, nullable)
  - `puppies_born` (int, default 0) — total born
  - `puppies_alive` (int, default 0) — current living count
  - `notes` (text, nullable)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

## Security
- RLS enabled on both tables.
- breeding_records scoped through dog → kennel ownership (via dog_id).
- litters scoped directly through kennel ownership (via kennel_id).
- Both have full CRUD policies for authenticated users only.
- CHECK constraints on record_type and status.
- updated_at triggers on both tables.
- Indexes on foreign keys and status fields.
*/

-- Create breeding_records first (without litter_id FK, added later)
CREATE TABLE IF NOT EXISTS breeding_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id uuid NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  sire_id uuid REFERENCES dogs(id) ON DELETE SET NULL,
  record_type text NOT NULL CHECK (record_type IN ('heat_cycle', 'mating', 'pregnancy')),
  record_date date NOT NULL DEFAULT CURRENT_DATE,
  expected_whelping_date date,
  actual_whelping_date date,
  status text NOT NULL DEFAULT 'observed' CHECK (
    status IN ('observed', 'planned', 'mated', 'confirmed_pregnant', 'whelped', 'unsuccessful')
  ),
  veterinary_confirmation boolean NOT NULL DEFAULT false,
  notes text,
  litter_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create litters (references breeding_records)
CREATE TABLE IF NOT EXISTS litters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kennel_id uuid NOT NULL REFERENCES kennels(id) ON DELETE CASCADE,
  name text,
  sire_id uuid REFERENCES dogs(id) ON DELETE SET NULL,
  dam_id uuid REFERENCES dogs(id) ON DELETE SET NULL,
  breeding_record_id uuid REFERENCES breeding_records(id) ON DELETE SET NULL,
  mating_date date,
  birth_date date,
  puppies_born int NOT NULL DEFAULT 0,
  puppies_alive int NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Now add the FK from breeding_records.litter_id to litters
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'breeding_records_litter_id_fkey'
  ) THEN
    ALTER TABLE breeding_records
      ADD CONSTRAINT breeding_records_litter_id_fkey
      FOREIGN KEY (litter_id) REFERENCES litters(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_breeding_records_dog_id ON breeding_records(dog_id);
CREATE INDEX IF NOT EXISTS idx_breeding_records_sire_id ON breeding_records(sire_id) WHERE sire_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_breeding_records_status ON breeding_records(status);
CREATE INDEX IF NOT EXISTS idx_litters_kennel_id ON litters(kennel_id);
CREATE INDEX IF NOT EXISTS idx_litters_dam_id ON litters(dam_id) WHERE dam_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_litters_sire_id ON litters(sire_id) WHERE sire_id IS NOT NULL;

-- RLS for breeding_records
ALTER TABLE breeding_records ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON breeding_records TO authenticated;

DROP POLICY IF EXISTS "select_own_breeding_records" ON breeding_records;
CREATE POLICY "select_own_breeding_records" ON breeding_records
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dogs d
      JOIN kennels k ON k.id = d.kennel_id
      WHERE d.id = breeding_records.dog_id AND k.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_own_breeding_records" ON breeding_records;
CREATE POLICY "insert_own_breeding_records" ON breeding_records
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dogs d
      JOIN kennels k ON k.id = d.kennel_id
      WHERE d.id = breeding_records.dog_id AND k.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_own_breeding_records" ON breeding_records;
CREATE POLICY "update_own_breeding_records" ON breeding_records
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dogs d
      JOIN kennels k ON k.id = d.kennel_id
      WHERE d.id = breeding_records.dog_id AND k.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dogs d
      JOIN kennels k ON k.id = d.kennel_id
      WHERE d.id = breeding_records.dog_id AND k.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_own_breeding_records" ON breeding_records;
CREATE POLICY "delete_own_breeding_records" ON breeding_records
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dogs d
      JOIN kennels k ON k.id = d.kennel_id
      WHERE d.id = breeding_records.dog_id AND k.owner_id = auth.uid()
    )
  );

-- RLS for litters
ALTER TABLE litters ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON litters TO authenticated;

DROP POLICY IF EXISTS "select_own_litters" ON litters;
CREATE POLICY "select_own_litters" ON litters
  FOR SELECT TO authenticated
  USING (auth.uid() = (SELECT owner_id FROM kennels WHERE kennels.id = litters.kennel_id));

DROP POLICY IF EXISTS "insert_own_litters" ON litters;
CREATE POLICY "insert_own_litters" ON litters
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = (SELECT owner_id FROM kennels WHERE kennels.id = litters.kennel_id));

DROP POLICY IF EXISTS "update_own_litters" ON litters;
CREATE POLICY "update_own_litters" ON litters
  FOR UPDATE TO authenticated
  USING (auth.uid() = (SELECT owner_id FROM kennels WHERE kennels.id = litters.kennel_id))
  WITH CHECK (auth.uid() = (SELECT owner_id FROM kennels WHERE kennels.id = litters.kennel_id));

DROP POLICY IF EXISTS "delete_own_litters" ON litters;
CREATE POLICY "delete_own_litters" ON litters
  FOR DELETE TO authenticated
  USING (auth.uid() = (SELECT owner_id FROM kennels WHERE kennels.id = litters.kennel_id));

-- Triggers
DROP TRIGGER IF EXISTS breeding_records_updated_at ON breeding_records;
CREATE TRIGGER breeding_records_updated_at
  BEFORE UPDATE ON breeding_records
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS litters_updated_at ON litters;
CREATE TRIGGER litters_updated_at
  BEFORE UPDATE ON litters
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
