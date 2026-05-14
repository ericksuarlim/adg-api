import { Sequelize } from 'sequelize';
import type { TenantDomainModels } from './tenant-domain-associations';

/**
 * Applies Sequelize model definitions to the tenant database (creates missing tables).
 * Bump TENANT_SCHEMA_VERSION and add migrations when you need non-additive DDL changes.
 */
export async function syncTenantOperationalSchema(
    sequelize: Sequelize,
    _models: TenantDomainModels
): Promise<void> {
    await sequelize.sync({ alter: false });
}
