import ApiError from '../errors/apiError';
import HttpStatusCodes from '../errors/httpStatusCodes';
import { TENANT_SCHEMA_VERSION } from '../constants/tenant.constants';
import { ITenantProvisioningService } from '../interfaces/services/tenant-provisioning-service.interface';
import CompanyRepository from '../repositories/company.repository';

/**
 * Creates tenant DB, persists `tenant_database` / `tenant_schema_version` on the company row,
 * and syncs operational schema. Ranches are created later (SaaS UI or company administrator).
 */
export async function attachOperationalTenantToCompany(
    uuid_company: string,
    tenantProvisioningService: ITenantProvisioningService,
    companyRepository: CompanyRepository
): Promise<{ tenant_database: string }> {
    const tenantDatabase = await tenantProvisioningService.provisionDatabase(uuid_company);

    const updatedCompany = await companyRepository.updateTenantProvisioning(uuid_company, {
        tenant_database: tenantDatabase,
        tenant_schema_version: TENANT_SCHEMA_VERSION,
    });

    if (!updatedCompany) {
        throw new ApiError({
            name: 'InternalError',
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            description: 'Failed to persist tenant_database on company',
        });
    }

    await tenantProvisioningService.bootstrapOperationalTenant(tenantDatabase);

    return { tenant_database: tenantDatabase };
}
