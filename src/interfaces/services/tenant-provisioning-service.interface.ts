export interface ITenantProvisioningService {
    provisionDatabase(companyUuid: string): Promise<string>;
    /** Connects to tenant DB and applies Sequelize sync (idempotent for existing tables). */
    bootstrapOperationalTenant(tenantDatabaseName: string): Promise<void>;
}
