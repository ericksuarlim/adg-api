-- Adds company-scoped role on users (PostgreSQL). Safe to run once on existing SaaS DBs.
-- Prefer Sequelize sync with DB_SYNC_ALTER in dev; use this in prod if you manage DDL manually.

ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(64) NOT NULL DEFAULT 'ranch_staff';

-- Optional: derive role from legacy user_ranches when users.role was defaulted
-- UPDATE users u SET role = sub.highest_role
-- FROM (
--   SELECT uuid_user, uuid_company, MAX(CASE role WHEN 'administrator' THEN 'administrator' WHEN 'ranch_staff' THEN 'ranch_staff' ELSE 'ranch_staff' END) ...
-- ) sub WHERE ... ;
