-- Migra valores históricos de `user_ranches.role` a `ranch_staff` (rol canónico de operador).
-- Ejecutar una vez por base de datos antes de depender solo de saas_owner | administrator | ranch_staff.

UPDATE user_ranches
SET role = 'ranch_staff'
WHERE role IN ('user', 'supervisor', 'healthcare_staff');
