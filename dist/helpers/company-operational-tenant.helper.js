"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachOperationalTenantToCompany = attachOperationalTenantToCompany;
const apiError_1 = __importDefault(require("../errors/apiError"));
const httpStatusCodes_1 = __importDefault(require("../errors/httpStatusCodes"));
const tenant_constants_1 = require("../constants/tenant.constants");
/**
 * Creates tenant DB, persists `tenant_database` / `tenant_schema_version` on the company row,
 * and syncs operational schema. Ranches are created later (SaaS UI or company administrator).
 */
async function attachOperationalTenantToCompany(uuid_company, tenantProvisioningService, companyRepository) {
    const tenantDatabase = await tenantProvisioningService.provisionDatabase(uuid_company);
    const updatedCompany = await companyRepository.updateTenantProvisioning(uuid_company, {
        tenant_database: tenantDatabase,
        tenant_schema_version: tenant_constants_1.TENANT_SCHEMA_VERSION,
    });
    if (!updatedCompany) {
        throw new apiError_1.default({
            name: 'InternalError',
            statusCode: httpStatusCodes_1.default.INTERNAL_SERVER_ERROR,
            description: 'Failed to persist tenant_database on company',
        });
    }
    await tenantProvisioningService.bootstrapOperationalTenant(tenantDatabase);
    return { tenant_database: tenantDatabase };
}
