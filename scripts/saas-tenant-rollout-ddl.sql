-- Run against the SaaS catalog database (DB_NAME). Adds columns/tables expected by the
-- multi-tenant SaaS + per-company DB rollout. Safe to re-run (IF NOT EXISTS).

ALTER TABLE user_ranches
    ADD COLUMN IF NOT EXISTS uuid_company UUID;

ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS tenant_database VARCHAR(128);

ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS tenant_schema_version INTEGER;

CREATE TABLE IF NOT EXISTS ranch_company_route (
    uuid_ranch UUID PRIMARY KEY,
    uuid_company UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ranch_company_route_uuid_company
    ON ranch_company_route (uuid_company);
