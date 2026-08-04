-- Per-step expected animals for corral work sessions (tenant DB).

CREATE UNIQUE INDEX IF NOT EXISTS uq_corral_step_animals_step_animal
    ON corral_step_animals (uuid_corral_session_step, animal_uuid)
    WHERE is_active = true;
