import sequelize from "../database";
import ApiError from "../errors/apiError";
import HttpStatusCodes from "../errors/httpStatusCodes";
import { ITenantProvisioningService } from "../interfaces/services/tenant-provisioning-service.interface";
import { TENANT_DB_NAME_PREFIX, TENANT_DB_SAFE_NAME_REGEX } from "../constants/tenant.constants";
import { getTenantPoolEntry } from "../database/tenant/tenant-sequelize-lru";

class TenantProvisioningService implements ITenantProvisioningService {
    async provisionDatabase(companyUuid: string): Promise<string> {
        const tenantDbName = this.buildTenantDatabaseName(companyUuid);
        await this.createDatabaseIfNotExists(tenantDbName);
        return tenantDbName;
    }

    async bootstrapOperationalTenant(tenantDatabaseName: string): Promise<void> {
        await getTenantPoolEntry(tenantDatabaseName);
    }

    private buildTenantDatabaseName(companyUuid: string): string {
        const normalizedUuid = companyUuid.replace(/-/g, '_').toLowerCase();
        return `${TENANT_DB_NAME_PREFIX}_${normalizedUuid}`;
    }

    private async createDatabaseIfNotExists(databaseName: string): Promise<void> {
        if (!TENANT_DB_SAFE_NAME_REGEX.test(databaseName)) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Invalid tenant database name'
            });
        }

        const sql = `CREATE DATABASE "${databaseName}"`;

        try {
            await sequelize.query(sql);
        } catch (error: any) {
            const pgDuplicateDatabaseCode = '42P04';
            if (error?.original?.code === pgDuplicateDatabaseCode) {
                return;
            }
            throw error;
        }
    }
}

export default TenantProvisioningService;
