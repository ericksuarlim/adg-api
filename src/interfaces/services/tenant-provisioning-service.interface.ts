export interface ITenantProvisioningService {
    provisionDatabase(companyUuid: string): Promise<string>;
}
