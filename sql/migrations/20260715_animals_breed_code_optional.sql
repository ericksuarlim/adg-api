-- Make animals.breed_code optional (nullable).
ALTER TABLE IF EXISTS animals ALTER COLUMN breed_code DROP NOT NULL;
ALTER TABLE IF EXISTS animals ALTER COLUMN breed_code DROP DEFAULT;
