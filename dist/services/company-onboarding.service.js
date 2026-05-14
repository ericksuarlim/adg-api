"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const apiError_1 = __importDefault(require("../errors/apiError"));
const httpStatusCodes_1 = __importDefault(require("../errors/httpStatusCodes"));
const auth_constants_1 = require("../constants/auth.constants");
const company_operational_tenant_helper_1 = require("../helpers/company-operational-tenant.helper");
class CompanyOnboardingService {
    constructor(companyOnboardingRepository, tenantProvisioningService, passwordValidatorService, companyRepository) {
        this.companyOnboardingRepository = companyOnboardingRepository;
        this.tenantProvisioningService = tenantProvisioningService;
        this.passwordValidatorService = passwordValidatorService;
        this.companyRepository = companyRepository;
    }
    async onboardCompany(data) {
        this.validatePayload(data);
        const [taxIdExists, usernameExists, emailExists] = await Promise.all([
            this.companyOnboardingRepository.existsByTaxId(data.tax_id),
            this.companyOnboardingRepository.existsByUsername(data.owner.username),
            this.companyOnboardingRepository.existsByEmail(data.owner.email),
        ]);
        if (taxIdExists) {
            throw new apiError_1.default({
                name: 'Conflict',
                statusCode: httpStatusCodes_1.default.CONFLICT,
                description: 'Company tax_id already exists'
            });
        }
        if (usernameExists) {
            throw new apiError_1.default({
                name: 'Conflict',
                statusCode: httpStatusCodes_1.default.CONFLICT,
                description: 'Owner username already exists'
            });
        }
        if (emailExists) {
            throw new apiError_1.default({
                name: 'Conflict',
                statusCode: httpStatusCodes_1.default.CONFLICT,
                description: 'Owner email already exists'
            });
        }
        this.passwordValidatorService.validate(data.owner.password);
        const passwordHash = await bcryptjs_1.default.hash(data.owner.password, auth_constants_1.BCRYPT_SALT_ROUNDS);
        const onboardingResult = await this.companyOnboardingRepository.createCompanyOwnerWithTransaction(data, passwordHash);
        const companyUuid = onboardingResult.company.uuid_company;
        const { tenant_database: tenantDatabase } = await (0, company_operational_tenant_helper_1.attachOperationalTenantToCompany)(companyUuid, this.tenantProvisioningService, this.companyRepository);
        return {
            success: true,
            data: {
                ...onboardingResult,
                tenant_database: tenantDatabase,
            }
        };
    }
    validatePayload(data) {
        if (!data.name || data.name.trim() === '') {
            throw new apiError_1.default({
                name: 'ValidationError',
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: 'Company name is required'
            });
        }
        if (!data.owner) {
            throw new apiError_1.default({
                name: 'ValidationError',
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: 'Owner data is required'
            });
        }
        const requiredOwnerFields = ['id_card', 'first_name', 'last_name', 'email', 'username', 'password'];
        const missingField = requiredOwnerFields.find((field) => {
            const value = data.owner[field];
            return !value || String(value).trim() === '';
        });
        if (missingField) {
            throw new apiError_1.default({
                name: 'ValidationError',
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: `Owner field ${missingField} is required`
            });
        }
    }
}
exports.default = CompanyOnboardingService;
