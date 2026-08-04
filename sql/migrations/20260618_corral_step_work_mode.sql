-- Per-step work mode for corral sessions (tenant DB).

ALTER TABLE IF EXISTS corral_session_steps
    ADD COLUMN IF NOT EXISTS work_mode VARCHAR(32) NOT NULL DEFAULT 'PRELOADED_SEARCH';
