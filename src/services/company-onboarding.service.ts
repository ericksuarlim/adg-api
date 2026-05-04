import bcrypt from "bcryptjs";
import ApiError from "../errors/apiError";
import HttpStatusCodes from "../errors/httpStatusCodes";
import { BCRYPT_SALT_ROUNDS } from "../constants/auth.constants";
import {
    CompanyOnboardingData,
    CompanyOnboardingResult
} from "../interfaces/company/company-onboarding.interface";
import { ServiceResponse } from "../interfaces/common/service-response.interface";
import { ICompanyOnboardingService } from "../interfaces/services/company-onboarding-service.interface";
import { ITenantProvisioningService } from "../interfaces/services/tenant-provisioning-service.interface";
import { IPasswordValidatorService } from "../interfaces/services/password-validator-service.interface";
import { ICompanyOnboardingRepository } from "../interfaces/repositories/company-onboarding-repository.interface";

class CompanyOnboardingService implements ICompanyOnboardingService {
    private readonly companyOnboardingRepository: ICompanyOnboardingRepository<CompanyOnboardingData, CompanyOnboardingResult>;
    private readonly tenantProvisioningService: ITenantProvisioningService;
    private readonly passwordValidatorService: IPasswordValidatorService;

    constructor(
        companyOnboardingRepository: ICompanyOnboardingRepository<CompanyOnboardingData, CompanyOnboardingResult>,
        tenantProvisioningService: ITenantProvisioningService,
        passwordValidatorService: IPasswordValidatorService
    ) {
        this.companyOnboardingRepository = companyOnboardingRepository;
        this.tenantProvisioningService = tenantProvisioningService;
        this.passwordValidatorService = passwordValidatorService;
    }

    async onboardCompany(data: CompanyOnboardingData): Promise<ServiceResponse<CompanyOnboardingResult>> {
        this.validatePayload(data);

        const [taxIdExists, usernameExists, emailExists] = await Promise.all([
            this.companyOnboardingRepository.existsByTaxId(data.tax_id),
            this.companyOnboardingRepository.existsByUsername(data.owner.username),
            this.companyOnboardingRepository.existsByEmail(data.owner.email),
        ]);

        if (taxIdExists) {
            throw new ApiError({
                name: 'Conflict',
                statusCode: HttpStatusCodes.CONFLICT,
                description: 'Company tax_id already exists'
            });
        }

        if (usernameExists) {
            throw new ApiError({
                name: 'Conflict',
                statusCode: HttpStatusCodes.CONFLICT,
                description: 'Owner username already exists'
            });
        }

        if (emailExists) {
            throw new ApiError({
                name: 'Conflict',
                statusCode: HttpStatusCodes.CONFLICT,
                description: 'Owner email already exists'
            });
        }

        this.passwordValidatorService.validate(data.owner.password);
        const passwordHash = await bcrypt.hash(data.owner.password, BCRYPT_SALT_ROUNDS);

        const onboardingResult = await this.companyOnboardingRepository.createCompanyOwnerWithTransaction(
            data,
            passwordHash
        );

        const tenantDatabase = await this.tenantProvisioningService.provisionDatabase(
            onboardingResult.company.uuid_company
        );

        return {
            success: true,
            data: {
                ...onboardingResult,
                tenant_database: tenantDatabase,
            }
        };
    }

    private validatePayload(data: CompanyOnboardingData): void {
        if (!data.name || data.name.trim() === '') {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Company name is required'
            });
        }

        if (!data.owner) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Owner data is required'
            });
        }

        const requiredOwnerFields = ['id_card', 'first_name', 'last_name', 'email', 'username', 'password'] as const;
        const missingField = requiredOwnerFields.find((field) => {
            const value = data.owner[field];
            return !value || String(value).trim() === '';
        });

        if (missingField) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: `Owner field ${missingField} is required`
            });
        }
    }
}

export default CompanyOnboardingService;
