-- Corral session operational refactor (tenant DB). Tables also created via sequelize.sync.

ALTER TABLE IF EXISTS corral_work_sessions
    ADD COLUMN IF NOT EXISTS responsible_person VARCHAR(256);

ALTER TABLE IF EXISTS corral_work_sessions
    ALTER COLUMN paddock_uuid DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_corral_session_animals_session_animal
    ON corral_session_animals (uuid_corral_work_session, animal_uuid)
    WHERE is_active = true;

CREATE UNIQUE INDEX IF NOT EXISTS uq_corral_activity_records_step_animal_activity
    ON corral_activity_records (uuid_corral_session_step, animal_uuid, activity_code)
    WHERE is_active = true;
