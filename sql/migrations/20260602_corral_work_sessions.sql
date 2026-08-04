-- Idempotent migration for corral work sessions (tenant databases).
-- New tables are also created by sequelize.sync on tenant bootstrap.

ALTER TABLE IF EXISTS animal_work_session
    ADD COLUMN IF NOT EXISTS uuid_corral_work_session UUID;

ALTER TABLE IF EXISTS animal_work_session
    ADD COLUMN IF NOT EXISTS medicine_uuid UUID;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'animal_work_session'
          AND column_name = 'work_session_id'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'animal_work_session'
          AND column_name = 'uuid_corral_work_session'
    ) THEN
        UPDATE animal_work_session
        SET uuid_corral_work_session = work_session_id::uuid
        WHERE uuid_corral_work_session IS NULL
          AND work_session_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

        ALTER TABLE animal_work_session DROP COLUMN IF EXISTS work_session_id;
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_animal_work_session_corral_animal
    ON animal_work_session (uuid_corral_work_session, uuid_animal)
    WHERE is_active = true AND uuid_corral_work_session IS NOT NULL;
