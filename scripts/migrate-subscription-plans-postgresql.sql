-- PostgreSQL: migrate company plan/billing enums to new SaaS catalog.
-- Run against the same database used by Sequelize (adjust type names if your DB differs).
-- Inspect actual enum names with:
--   SELECT t.typname, e.enumlabel
--   FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
--   WHERE typname LIKE '%companies%plan%' OR typname LIKE '%billing%';

-- 1) Add new enum labels (ignore errors if values already exist)

ALTER TYPE "enum_companies_plan_type" ADD VALUE IF NOT EXISTS 'ESSENTIAL';
ALTER TYPE "enum_companies_plan_type" ADD VALUE IF NOT EXISTS 'ENTERPRISE';

ALTER TYPE "enum_companies_billing_cycle" ADD VALUE IF NOT EXISTS 'SEMESTRAL';

ALTER TYPE "enum_company_payments_plan_type" ADD VALUE IF NOT EXISTS 'ESSENTIAL';
ALTER TYPE "enum_company_payments_plan_type" ADD VALUE IF NOT EXISTS 'ENTERPRISE';

ALTER TYPE "enum_company_payments_billing_cycle" ADD VALUE IF NOT EXISTS 'SEMESTRAL';

-- 2) Rewrite existing rows to new domain values

UPDATE companies SET plan_type = 'ESSENTIAL' WHERE plan_type = 'BASIC';
UPDATE companies SET plan_type = 'ENTERPRISE' WHERE plan_type = 'PREMIUM';

UPDATE companies SET billing_cycle = 'ANNUAL' WHERE billing_cycle = 'MONTHLY';

UPDATE company_payments SET plan_type = 'ESSENTIAL' WHERE plan_type = 'BASIC';
UPDATE company_payments SET plan_type = 'ENTERPRISE' WHERE plan_type = 'PREMIUM';

UPDATE company_payments SET billing_cycle = 'ANNUAL' WHERE billing_cycle = 'MONTHLY';

-- Note: PostgreSQL does not support removing unused enum labels in place.
-- Old labels (BASIC, PREMIUM, MONTHLY) may remain on the type until you rebuild types in a maintenance window.
