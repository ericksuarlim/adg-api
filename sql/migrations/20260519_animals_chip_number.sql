ALTER TABLE IF EXISTS animals ADD COLUMN IF NOT EXISTS chip_number VARCHAR(128);

CREATE UNIQUE INDEX IF NOT EXISTS uq_animals_ranch_chip_number
  ON animals (ranch_uuid, chip_number)
  WHERE chip_number IS NOT NULL AND btrim(chip_number) <> '';
