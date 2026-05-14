"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../database"));
const apiError_1 = __importDefault(require("../errors/apiError"));
const httpStatusCodes_1 = __importDefault(require("../errors/httpStatusCodes"));
const tenant_constants_1 = require("../constants/tenant.constants");
const tenant_sequelize_lru_1 = require("../database/tenant/tenant-sequelize-lru");
class TenantProvisioningService {
    async provisionDatabase(companyUuid) {
        const tenantDbName = this.buildTenantDatabaseName(companyUuid);
        await this.createDatabaseIfNotExists(tenantDbName);
        return tenantDbName;
    }
    async bootstrapOperationalTenant(tenantDatabaseName) {
        await (0, tenant_sequelize_lru_1.getTenantPoolEntry)(tenantDatabaseName);
    }
    buildTenantDatabaseName(companyUuid) {
        const normalizedUuid = companyUuid.replace(/-/g, '_').toLowerCase();
        return `${tenant_constants_1.TENANT_DB_NAME_PREFIX}_${normalizedUuid}`;
    }
    async createDatabaseIfNotExists(databaseName) {
        if (!tenant_constants_1.TENANT_DB_SAFE_NAME_REGEX.test(databaseName)) {
            throw new apiError_1.default({
                name: 'ValidationError',
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: 'Invalid tenant database name'
            });
        }
        const sql = `CREATE DATABASE "${databaseName}"`;
        try {
            await database_1.default.query(sql);
        }
        catch (error) {
            const pgDuplicateDatabaseCode = '42P04';
            if (error?.original?.code === pgDuplicateDatabaseCode) {
                return;
            }
            throw error;
        }
    }
}
exports.default = TenantProvisioningService;
