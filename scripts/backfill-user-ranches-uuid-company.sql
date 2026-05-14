-- Backfill user_ranches.uuid_company from users.uuid_company (SaaS DB).
-- Prerequisite: run scripts/saas-tenant-rollout-ddl.sql (or start API once with DB_SYNC_ALTER=true in dev).
-- New installs set uuid_company on insert; this fixes legacy rows before tenant split.

UPDATE user_ranches ur
SET uuid_company = u.uuid_company,
    updated_at = NOW()
FROM users u
WHERE ur.uuid_user = u.uuid_user
  AND ur.uuid_company IS NULL;
