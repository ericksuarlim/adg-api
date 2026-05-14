"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncTenantOperationalSchema = syncTenantOperationalSchema;
/**
 * Applies Sequelize model definitions to the tenant database (creates missing tables).
 * Bump TENANT_SCHEMA_VERSION and add migrations when you need non-additive DDL changes.
 */
async function syncTenantOperationalSchema(sequelize, _models) {
    await sequelize.sync({ alter: false });
}
