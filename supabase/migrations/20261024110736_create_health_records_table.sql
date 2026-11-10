/*
# Create health_records table

## Purpose
A unified health record system covering vaccinations, medications, illnesses,
vet visits, tests, allergies, deworming, and general health observations.
A single table with a `record_type` discriminator keeps the schema simple
while supporting the diverse health tracking needs of breeders.

## New Tables
- `health_records`
  - `id` (uuid, primary key)
  - `dog_id` (uuid, not null) — FK to dogs, cascades on delete
  - `record_type` (text, not null) — one of: vaccination, medication, illness,
    vet_visit, test_result, allergy, deworming, weight, other
  - `title` (text, not null) — short description (e.g., "Rabies Vaccination")
  - `date` (date, not null) — when the event occurred
  - `next_due_date` (date, nullable) — for vaccinations, deworming, etc.
  - `veterinarian` (text, nullable) — administering professional
  - `details` (text, nullable) — full description, dosage, symptoms, etc.
  - `dosage` (text, nullable) — medication dosage as prescribed
  - `start_date` (date, nullable) — for medications with a duration
  - `end_date` (date, nullable) — for medications with a duration
  - `result` (text, nullable) — test results or outcome
  - `attachment_url` (text, nullable) — link to uploaded document in storage
  - `is_resolved` (boolean, default false) — for illnesses/conditions
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

## Security
- RLS enabled on `health_records`.
- Grant SELECT, INSERT, UPDATE, DELETE to `authenticated`.
- All four CRUD policies scope through dog → kennel ownership.
- updated_at trigger via handle_updated_at().
- Index on dog_id and on next_due_date for upcoming-care queries.
- CHECK constraint on record_type for valid values.
*/

CREATE TABLE IF NOT EXISTS health_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id uuid NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  record_type text NOT NULL CHECK (
    record_type IN ('vaccination', 'medication', 'illness', 'vet_visit',
      'test_result', 'allergy', 'deworming', 'weight', 'other')
  ),
  title text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  next_due_date date,
  veterinarian text,
  details text,
  dosage text,
  start_date date,
  end_date date,
  result text,
  attachment_url text,
  is_resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_health_records_dog_id ON health_records(dog_id);
CREATE INDEX IF NOT EXISTS idx_health_records_next_due ON health_records(next_due_date) WHERE next_due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_health_records_type ON health_records(record_type);

ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON health_records TO authenticated;

DROP POLICY IF EXISTS "select_own_health_records" ON health_records;
CREATE POLICY "select_own_health_records" ON health_records
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dogs d
      JOIN kennels k ON k.id = d.kennel_id
      WHERE d.id = health_records.dog_id AND k.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_own_health_records" ON health_records;
CREATE POLICY "insert_own_health_records" ON health_records
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dogs d
      JOIN kennels k ON k.id = d.kennel_id
      WHERE d.id = health_records.dog_id AND k.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_own_health_records" ON health_records;
CREATE POLICY "update_own_health_records" ON health_records
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dogs d
      JOIN kennels k ON k.id = d.kennel_id
      WHERE d.id = health_records.dog_id AND k.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dogs d
      JOIN kennels k ON k.id = d.kennel_id
      WHERE d.id = health_records.dog_id AND k.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_own_health_records" ON health_records;
CREATE POLICY "delete_own_health_records" ON health_records
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dogs d
      JOIN kennels k ON k.id = d.kennel_id
      WHERE d.id = health_records.dog_id AND k.owner_id = auth.uid()
    )
  );

DROP TRIGGER IF EXISTS health_records_updated_at ON health_records;
CREATE TRIGGER health_records_updated_at
  BEFORE UPDATE ON health_records
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
