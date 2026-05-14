-- Animal domain refactor (Postgres). Run against the tenant / app database.
-- Review backups before applying in production.

-- 1) Drop company association on animals
ALTER TABLE IF EXISTS animals DROP CONSTRAINT IF EXISTS animals_uuid_company_fkey;
ALTER TABLE IF EXISTS animals DROP COLUMN IF EXISTS uuid_company;

-- 2) Remove live weight from animal row (use weight_records)
ALTER TABLE IF EXISTS animals DROP COLUMN IF EXISTS current_weight;

-- 3) Replace breed UUID with breed code
ALTER TABLE IF EXISTS animals ADD COLUMN IF NOT EXISTS breed_code VARCHAR(64);
UPDATE animals SET breed_code = COALESCE(NULLIF(trim(breed_uuid::text), ''), 'UNKNOWN') WHERE breed_code IS NULL;
ALTER TABLE IF EXISTS animals DROP COLUMN IF EXISTS breed_uuid;
ALTER TABLE IF EXISTS animals ALTER COLUMN breed_code SET NOT NULL;
ALTER TABLE IF EXISTS animals ALTER COLUMN breed_code SET DEFAULT 'UNKNOWN';

-- 4) Registration number (unique per ranch)
ALTER TABLE IF EXISTS animals ADD COLUMN IF NOT EXISTS registration_number VARCHAR(128);
UPDATE animals SET registration_number = animal_uuid::text
  WHERE registration_number IS NULL OR trim(registration_number) = '';
ALTER TABLE IF EXISTS animals ALTER COLUMN registration_number SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_animals_ranch_registration ON animals (ranch_uuid, registration_number);

-- 5) Sex default at DB level (new rows)
ALTER TABLE IF EXISTS animals ALTER COLUMN sex SET DEFAULT 'MALE';
