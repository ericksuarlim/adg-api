-- Seed mínimo: compañía CattlePro + usuario saas_owner (rol en `users.role`, BD SaaS).
-- Ejecutar DESPUÉS de que existan las tablas (arranca la API una vez con sync, o aplica DDL SaaS).
--
-- === Cómo ejecutarlo (elige una) ===
--
-- A) Desde tu Mac, si Postgres está en Docker (puerto host 15433 según .env.example):
--    psql "postgresql://adg-user-postgres:postgres@localhost:15433/adg-db-postgres" -f scripts/seed-saas-admin.sql
--
-- B) Si tu .env usa otro puerto/host/contraseña, copia DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME.
--
-- C) Dentro del contenedor de Postgres (nombre de servicio suele ser "postgres"):
--    docker compose exec -T postgres psql -U adg-user-postgres -d adg-db-postgres < scripts/seed-saas-admin.sql
--    (ejecuta desde la carpeta adg-api donde está docker-compose.yml)
--
-- Si falla por duplicado (email/username ya existen), borra antes las filas de prueba o cambia UUIDs/email en este archivo.
--
-- Credenciales tras el seed:
--   Compañía: CattlePro
--   usuario: erick.suarez
--   contraseña: Erick.suarez1
-- (hash bcrypt generado con: node -e "console.log(require('bcryptjs').hashSync('TU_CLAVE', 10))" en carpeta adg-api)

WITH ids AS (
  SELECT
    '11111111-1111-1111-1111-111111111101'::uuid AS uuid_company,
    '22222222-2222-2222-2222-222222222201'::uuid AS uuid_user
)
INSERT INTO companies (
  uuid_company,
  name,
  plan_type,
  billing_cycle,
  membership_status,
  tenant_database,
  tenant_schema_version,
  is_active,
  created_at,
  updated_at
)
SELECT
  uuid_company,
  'CattlePro',
  'ESSENTIAL'::"enum_companies_plan_type",
  'ANNUAL'::"enum_companies_billing_cycle",
  'ACTIVE'::"enum_companies_membership_status",
  NULL,
  0,
  true,
  NOW(),
  NOW()
FROM ids;

WITH ids AS (
  SELECT
    '11111111-1111-1111-1111-111111111101'::uuid AS uuid_company,
    '22222222-2222-2222-2222-222222222201'::uuid AS uuid_user
)
INSERT INTO users (
  uuid_user,
  uuid_company,
  id_card,
  first_name,
  last_name,
  email,
  username,
  password,
  role,
  is_active,
  created_at,
  updated_at
)
SELECT
  uuid_user,
  uuid_company,
  '0000000000',
  'Erick',
  'Suarez',
  'erick.suarez@cattlepro.local',
  'erick.suarez',
  '$2b$10$8cSkLMhX9U6HMpJ5tUmVLuZOGPx8gyI6rVss2fRwIFYQikOX9ICpy',
  'saas_owner',
  true,
  NOW(),
  NOW()
FROM ids;
