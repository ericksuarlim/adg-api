import { QueryTypes, Sequelize } from 'sequelize';
import type { TenantDomainModels } from './tenant-domain-associations';

/**
 * Idempotent DDL patches applied after `sequelize.sync` on each tenant database.
 * `sync({ alter: false })` does not add columns to existing tables; run additive SQL here.
 */
const TENANT_DDL_PATCHES: string[] = [
    `ALTER TABLE IF EXISTS animals ADD COLUMN IF NOT EXISTS chip_number VARCHAR(128);`,
    `CREATE UNIQUE INDEX IF NOT EXISTS uq_animals_ranch_chip_number
       ON animals (ranch_uuid, chip_number)
       WHERE chip_number IS NOT NULL AND btrim(chip_number) <> '';`,
];

async function animalsBirthDateColumnExists(sequelize: Sequelize): Promise<boolean> {
    const rows = await sequelize.query<{ exists: boolean }>(
        `SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'animals'
              AND column_name = 'birth_date'
        ) AS exists`,
        { type: QueryTypes.SELECT }
    );
    return Boolean(rows[0]?.exists);
}

async function applyBirthDateNotNullIfNeeded(sequelize: Sequelize): Promise<void> {
    if (!(await animalsBirthDateColumnExists(sequelize))) {
        return;
    }
    await sequelize.query(`
        UPDATE animals
        SET birth_date = DATE '2000-01-01'
        WHERE birth_date IS NULL;
    `);
    await sequelize.query(`
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name = 'animals'
                  AND column_name = 'birth_date'
                  AND is_nullable = 'YES'
            ) THEN
                ALTER TABLE animals ALTER COLUMN birth_date SET NOT NULL;
            END IF;
        END $$;
    `);
}

async function applyTenantDdlPatches(sequelize: Sequelize): Promise<void> {
    for (const sql of TENANT_DDL_PATCHES) {
        await sequelize.query(sql);
    }
    await applyBirthDateNotNullIfNeeded(sequelize);
}

/**
 * Applies Sequelize model definitions to the tenant database (creates missing tables).
 * Bump TENANT_SCHEMA_VERSION and add migrations when you need non-additive DDL changes.
 */
export async function syncTenantOperationalSchema(
    sequelize: Sequelize,
    _models: TenantDomainModels
): Promise<void> {
    await sequelize.sync({ alter: false });
    await applyTenantDdlPatches(sequelize);
}
