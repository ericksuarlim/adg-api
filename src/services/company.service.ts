import { CompanyAttributes, CompanyCreationAttributes } from "../interfaces/company/company.interface";
import { ServiceResponse } from "../interfaces/common/service-response.interface";
import { IBaseServiceInterface } from "../interfaces/services/base-service.interface";
import { IBaseRepository } from "../interfaces/repositories/base-repository.interface";
import ApiError from "../errors/apiError";
import HttpStatusCodes from "../errors/httpStatusCodes";
import { CompanyModel } from "../database/models";
import {IBaseParams} from "../interfaces/params/query.interface";
import CompanyPaymentModel from "../database/models/company-payment.model";
import { CompanyPaymentCreationAttributes } from "../interfaces/company/company-payment.interface";

class CompanyService implements IBaseServiceInterface<CompanyAttributes, CompanyCreationAttributes> {

    private readonly companyRepository: IBaseRepository<CompanyModel, CompanyCreationAttributes>;
    private readonly companyPaymentRepository: IBaseRepository<CompanyPaymentModel, CompanyPaymentCreationAttributes>;

    constructor(
        companyRepository: IBaseRepository<CompanyModel, CompanyCreationAttributes>,
        companyPaymentRepository: IBaseRepository<CompanyPaymentModel, CompanyPaymentCreationAttributes>,
    ) {
        this.companyRepository = companyRepository;
        this.companyPaymentRepository = companyPaymentRepository;
    }

    async getAll(params: IBaseParams): Promise<ServiceResponse<CompanyAttributes[]>> {

        const {rows, count} = await this.companyRepository.findAll(params);

        const plainCompanies = rows.map(company => company.get({plain: true}));

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

    async create(companyBody: CompanyCreationAttributes): Promise<ServiceResponse<CompanyAttributes>> {
        const payload = this.buildCompanyCreatePayload(companyBody);
        const company = await this.companyRepository.create(payload);

        return {
            success: true,
            data: company.get({ plain: true })
        };
    }

    async getById(params: { id: string, includeInactive?: boolean, uuid_company?: string}): Promise<ServiceResponse<CompanyAttributes>> {
        const { id: uuid_company, includeInactive, uuid_company: tenantCompany } = params;

        if (!uuid_company || uuid_company.trim() === '') {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'uuid_company is required'
            });
        }

        const company = await this.companyRepository.findById({ id:uuid_company, includeInactive, uuid_company: tenantCompany });

        if (!company) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Company not found'
            });
        }

        return {
            success: true,
            data: company.get({ plain: true })
        };
    }

    async update(
        uuid_company: string,
        companyBody: CompanyCreationAttributes,
        tenantContext?: { uuid_company?: string }
    ): Promise<ServiceResponse<CompanyAttributes>> {
        if (!uuid_company || uuid_company.trim() === '') {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Company Name is required'
            });
        }

        const currentCompany = await this.companyRepository.findById({
            id: uuid_company,
            uuid_company: tenantContext?.uuid_company
        });

        if (!currentCompany) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Company not found or inactive'
            });
        }

        const payload = this.buildCompanyPayload(
            companyBody,
            currentCompany.get({ plain: true })
        );
        const updatedCompany = await this.companyRepository.update(uuid_company, payload, tenantContext);

        if (!updatedCompany) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Company not found or inactive'
            });
        }

        return {
            success: true,
            data: updatedCompany.get({ plain: true })
        };
    }

    async delete(uuid_company: string, tenantContext?: { uuid_company?: string }): Promise<ServiceResponse<null>> {
        if (!uuid_company || uuid_company.trim() === '') {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Company Name is required'
            });
        }

        const deleted = await this.companyRepository.delete(uuid_company, tenantContext);

        if (!deleted) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Company not found or already inactive'
            });
        }

        return {
            success: true,
            data: null
        };
    }

    async activateTrial(
        uuid_company: string,
        trialStartDate: string,
        trialEndDate: string,
        tenantContext?: { uuid_company?: string }
    ): Promise<ServiceResponse<CompanyAttributes>> {
        if (!trialStartDate || !trialEndDate) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Trial start and end dates are required'
            });
        }

        const startDate = new Date(trialStartDate);
        const endDate = new Date(trialEndDate);
        if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Invalid trial dates'
            });
        }

        if (startDate >= endDate) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Trial end date must be after start date'
            });
        }

        const currentCompany = await this.companyRepository.findById({
            id: uuid_company,
            uuid_company: tenantContext?.uuid_company
        });
        if (!currentCompany) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Company not found or inactive'
            });
        }

        const currentRenewalAt = currentCompany.membership_renewal_at ? new Date(currentCompany.membership_renewal_at) : null;
        const hasActivePaidSubscription = currentCompany.membership_status === 'ACTIVE'
            && !!currentRenewalAt
            && currentRenewalAt.getTime() >= Date.now();
        if (hasActivePaidSubscription) {
            throw new ApiError({
                name: 'SubscriptionAlreadyActive',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Company already has an active paid subscription'
            });
        }

        const hasActiveTrial = currentCompany.membership_status === 'TRIAL'
            && !!currentRenewalAt
            && currentRenewalAt.getTime() >= Date.now();
        if (hasActiveTrial) {
            throw new ApiError({
                name: 'TrialAlreadyActive',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Company already has an active trial'
            });
        }

        const payload: CompanyCreationAttributes = {
            membership_status: 'TRIAL',
            membership_started_at: startDate,
            membership_renewal_at: endDate,
            is_active: true
        };
        const updatedCompany = await this.update(uuid_company, payload, tenantContext);

        await this.companyPaymentRepository.create({
            uuid_company,
            amount: 0,
            currency: 'BOB',
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

    private buildCompanyPayload(
        companyBody: CompanyCreationAttributes,
        currentCompany?: CompanyAttributes
    ): CompanyCreationAttributes {
        const payload: CompanyCreationAttributes = {
            ...companyBody
        };

        const effectiveStartedAt = companyBody.membership_started_at ?? currentCompany?.membership_started_at ?? null;
        const effectiveBillingCycle = companyBody.billing_cycle ?? currentCompany?.billing_cycle;

        payload.membership_started_at = effectiveStartedAt;
        payload.membership_renewal_at = this.calculateMembershipRenewalAt(effectiveStartedAt, effectiveBillingCycle);

        return payload;
    }

    private buildCompanyCreatePayload(companyBody: CompanyCreationAttributes): CompanyCreationAttributes {
        return {
            name: companyBody.name,
            legal_name: companyBody.legal_name ?? null,
            tax_id: companyBody.tax_id ?? null,
            is_active: companyBody.is_active ?? true
        };
    }

    private calculateMembershipRenewalAt(
        membershipStartedAt: Date | string | null | undefined,
        billingCycle: CompanyAttributes['billing_cycle'] | undefined
    ): Date | null {
        if (!membershipStartedAt || !billingCycle) {
            return null;
        }

        const renewalDate = new Date(membershipStartedAt);
        if (Number.isNaN(renewalDate.getTime())) {
            return null;
        }

        if (billingCycle === 'MONTHLY') {
            renewalDate.setMonth(renewalDate.getMonth() + 1);
        }

        if (billingCycle === 'ANNUAL') {
            renewalDate.setFullYear(renewalDate.getFullYear() + 1);
        }

        return renewalDate;
    }
}

export default CompanyService;