"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apiError_1 = __importDefault(require("../errors/apiError"));
const httpStatusCodes_1 = __importDefault(require("../errors/httpStatusCodes"));
const company_operational_tenant_helper_1 = require("../helpers/company-operational-tenant.helper");
class CompanyService {
    constructor(companyRepository, companyPaymentRepository, tenantProvisioningService) {
        this.companyRepository = companyRepository;
        this.companyPaymentRepository = companyPaymentRepository;
        this.tenantProvisioningService = tenantProvisioningService;
    }
    async getAll(params) {
        const { rows, count } = await this.companyRepository.findAll(params);
        const plainCompanies = rows.map(company => company.get({ plain: true }));
        return {
            success: true,
            data: plainCompanies,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / params.size),
                currentPage: params.page,
                order: params.order,
                pageSize: params.size
            }
        };
    }
    async create(companyBody, _options) {
        const payload = this.buildCompanyCreatePayload(companyBody);
        const company = await this.companyRepository.create(payload);
        const uuid_company = company.uuid_company;
        await (0, company_operational_tenant_helper_1.attachOperationalTenantToCompany)(uuid_company, this.tenantProvisioningService, this.companyRepository);
        const refreshed = await this.companyRepository.findById({
            id: uuid_company,
            includeInactive: true,
        });
        if (!refreshed) {
            throw new apiError_1.default({
                name: 'InternalError',
                statusCode: httpStatusCodes_1.default.INTERNAL_SERVER_ERROR,
                description: 'Company not found after tenant provisioning',
            });
        }
        return {
            success: true,
            data: refreshed.get({ plain: true })
        };
    }
    async getById(params) {
        const { id: uuid_company, includeInactive, uuid_company: tenantCompany } = params;
        if (!uuid_company || uuid_company.trim() === '') {
            throw new apiError_1.default({
                name: 'ValidationError',
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: 'uuid_company is required'
            });
        }
        const company = await this.companyRepository.findById({ id: uuid_company, includeInactive, uuid_company: tenantCompany });
        if (!company) {
            throw new apiError_1.default({
                name: 'NotFound',
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
                description: 'Company not found'
            });
        }
        return {
            success: true,
            data: company.get({ plain: true })
        };
    }
    async update(uuid_company, companyBody, tenantContext) {
        if (!uuid_company || uuid_company.trim() === '') {
            throw new apiError_1.default({
                name: 'ValidationError',
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: 'Company Name is required'
            });
        }
        const currentCompany = await this.companyRepository.findById({
            id: uuid_company,
            uuid_company: tenantContext?.uuid_company
        });
        if (!currentCompany) {
            throw new apiError_1.default({
                name: 'NotFound',
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
                description: 'Company not found or inactive'
            });
        }
        const payload = this.buildCompanyPayload(companyBody, currentCompany.get({ plain: true }));
        const updatedCompany = await this.companyRepository.update(uuid_company, payload, tenantContext);
        if (!updatedCompany) {
            throw new apiError_1.default({
                name: 'NotFound',
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
                description: 'Company not found or inactive'
            });
        }
        return {
            success: true,
            data: updatedCompany.get({ plain: true })
        };
    }
    async delete(uuid_company, tenantContext) {
        if (!uuid_company || uuid_company.trim() === '') {
            throw new apiError_1.default({
                name: 'ValidationError',
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: 'Company Name is required'
            });
        }
        const deleted = await this.companyRepository.delete(uuid_company, tenantContext);
        if (!deleted) {
            throw new apiError_1.default({
                name: 'NotFound',
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
                description: 'Company not found or already inactive'
            });
        }
        return {
            success: true,
            data: null
        };
    }
    async reactivate(uuid_company, tenantContext) {
        if (!uuid_company || uuid_company.trim() === '') {
            throw new apiError_1.default({
                name: 'ValidationError',
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: 'uuid_company is required'
            });
        }
        const reactivated = await this.companyRepository.reactivate(uuid_company, tenantContext);
        if (!reactivated) {
            throw new apiError_1.default({
                name: 'NotFound',
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
                description: 'Company not found or already active'
            });
        }
        const row = await this.companyRepository.findById({
            id: uuid_company,
            includeInactive: true,
            uuid_company: tenantContext?.uuid_company
        });
        if (!row) {
            throw new apiError_1.default({
                name: 'NotFound',
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
                description: 'Company not found after reactivate'
            });
        }
        return {
            success: true,
            data: row.get({ plain: true })
        };
    }
    async endSubscription(uuid_company, tenantContext) {
        if (!uuid_company || uuid_company.trim() === '') {
            throw new apiError_1.default({
                name: 'ValidationError',
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: 'uuid_company is required'
            });
        }
        const currentCompany = await this.companyRepository.findById({
            id: uuid_company,
            includeInactive: true,
            uuid_company: tenantContext?.uuid_company
        });
        if (!currentCompany) {
            throw new apiError_1.default({
                name: 'NotFound',
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
                description: 'Company not found'
            });
        }
        const plain = currentCompany.get({ plain: true });
        if (!plain.is_active) {
            throw new apiError_1.default({
                name: 'ValidationError',
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: 'Company is archived'
            });
        }
        const updated = await this.companyRepository.updateMembershipState(uuid_company, {
            membership_status: 'CANCELLED',
            membership_renewal_at: null
        }, tenantContext);
        if (!updated) {
            throw new apiError_1.default({
                name: 'NotFound',
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
                description: 'Company could not be updated'
            });
        }
        return {
            success: true,
            data: updated.get({ plain: true })
        };
    }
    async activateTrial(uuid_company, trialStartDate, trialEndDate, tenantContext) {
        if (!trialStartDate || !trialEndDate) {
            throw new apiError_1.default({
                name: 'ValidationError',
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: 'Trial start and end dates are required'
            });
        }
        const startDate = new Date(trialStartDate);
        const endDate = new Date(trialEndDate);
        if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
            throw new apiError_1.default({
                name: 'ValidationError',
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: 'Invalid trial dates'
            });
        }
        if (startDate >= endDate) {
            throw new apiError_1.default({
                name: 'ValidationError',
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: 'Trial end date must be after start date'
            });
        }
        const currentCompany = await this.companyRepository.findById({
            id: uuid_company,
            uuid_company: tenantContext?.uuid_company
        });
        if (!currentCompany) {
            throw new apiError_1.default({
                name: 'NotFound',
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
                description: 'Company not found or inactive'
            });
        }
        const currentRenewalAt = currentCompany.membership_renewal_at ? new Date(currentCompany.membership_renewal_at) : null;
        const hasActivePaidSubscription = currentCompany.membership_status === 'ACTIVE'
            && !!currentRenewalAt
            && currentRenewalAt.getTime() >= Date.now();
        if (hasActivePaidSubscription) {
            throw new apiError_1.default({
                name: 'SubscriptionAlreadyActive',
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: 'Company already has an active paid subscription'
            });
        }
        const hasActiveTrial = currentCompany.membership_status === 'TRIAL'
            && !!currentRenewalAt
            && currentRenewalAt.getTime() >= Date.now();
        if (hasActiveTrial) {
            throw new apiError_1.default({
                name: 'TrialAlreadyActive',
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: 'Company already has an active trial'
            });
        }
        const payload = {
            membership_status: 'TRIAL',
            membership_started_at: startDate,
            membership_renewal_at: endDate,
            is_active: true
        };
        const updatedCompany = await this.update(uuid_company, payload, tenantContext);
        await this.companyPaymentRepository.create({
            uuid_company,
            amount: 0,
            currency: 'USD',
            payment_method: null,
            paid_at: startDate,
            period_start: startDate,
            period_end: endDate,
            plan_type: currentCompany.plan_type,
            billing_cycle: currentCompany.billing_cycle,
            status: 'POSTED'
        });
        return updatedCompany;
    }
    buildCompanyPayload(companyBody, currentCompany) {
        const payload = {
            ...companyBody
        };
        const effectiveStartedAt = companyBody.membership_started_at ?? currentCompany?.membership_started_at ?? null;
        const effectiveBillingCycle = companyBody.billing_cycle ?? currentCompany?.billing_cycle;
        payload.membership_started_at = effectiveStartedAt;
        payload.membership_renewal_at = this.calculateMembershipRenewalAt(effectiveStartedAt, effectiveBillingCycle);
        return payload;
    }
    buildCompanyCreatePayload(companyBody) {
        return {
            name: companyBody.name,
            legal_name: companyBody.legal_name ?? null,
            tax_id: companyBody.tax_id ?? null,
            is_active: companyBody.is_active ?? true,
            membership_status: 'CANCELLED',
            membership_started_at: null,
            membership_renewal_at: null
        };
    }
    calculateMembershipRenewalAt(membershipStartedAt, billingCycle) {
        if (!membershipStartedAt || !billingCycle) {
            return null;
        }
        const renewalDate = new Date(membershipStartedAt);
        if (Number.isNaN(renewalDate.getTime())) {
            return null;
        }
        if (billingCycle === 'SEMESTRAL') {
            renewalDate.setMonth(renewalDate.getMonth() + 6);
        }
        if (billingCycle === 'ANNUAL') {
            renewalDate.setFullYear(renewalDate.getFullYear() + 1);
        }
        return renewalDate;
    }
}
exports.default = CompanyService;
