-- Animals: birth_date is required (year of birth at minimum; stored as DATE).
-- Backfill unknown legacy rows to a neutral placeholder so NOT NULL can be applied.

UPDATE animals
SET birth_date = DATE '2000-01-01'
WHERE birth_date IS NULL;

ALTER TABLE animals
  ALTER COLUMN birth_date SET NOT NULL;
