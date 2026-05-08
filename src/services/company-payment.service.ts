import { IBaseServiceInterface } from "../interfaces/services/base-service.interface";
import {
    CompanyPaymentAttributes,
    CompanyPaymentCreationAttributes
} from "../interfaces/company/company-payment.interface";
import { ServiceResponse } from "../interfaces/common/service-response.interface";
import { IBaseRepository } from "../interfaces/repositories/base-repository.interface";
import CompanyPaymentModel from "../database/models/company-payment.model";
import { IBaseParams } from "../interfaces/params/query.interface";
import ApiError from "../errors/apiError";
import HttpStatusCodes from "../errors/httpStatusCodes";
import { CompanyAttributes, CompanyCreationAttributes } from "../interfaces/company/company.interface";
import { CompanyModel } from "../database/models";
import { BillingCycle, PAYMENT_METHODS } from "../constants/domain.constants";
import { ANNUAL_DISCOUNT_PERCENT, PLAN_PRICES_BS } from "../constants/subscription.constants";

class CompanyPaymentService implements IBaseServiceInterface<CompanyPaymentAttributes, CompanyPaymentCreationAttributes> {
    private readonly companyPaymentRepository: IBaseRepository<CompanyPaymentModel, CompanyPaymentCreationAttributes>;
    private readonly companyService: IBaseServiceInterface<CompanyAttributes, CompanyCreationAttributes>;

    constructor(
        companyPaymentRepository: IBaseRepository<CompanyPaymentModel, CompanyPaymentCreationAttributes>,
        companyService: IBaseServiceInterface<CompanyAttributes, CompanyCreationAttributes>
    ) {
        this.companyPaymentRepository = companyPaymentRepository;
        this.companyService = companyService;
    }

    private calculateNextRenewalDate(fromDate: Date, billingCycle: BillingCycle): Date {
        const renewalDate = new Date(fromDate);
        if (billingCycle === 'ANNUAL') {
            renewalDate.setFullYear(renewalDate.getFullYear() + 1);
        } else {
            renewalDate.setMonth(renewalDate.getMonth() + 1);
        }
        return renewalDate;
    }

    private calculateActivationAmount(planType: CompanyPaymentAttributes['plan_type'], billingCycle: BillingCycle): number {
        const monthlyPrice = PLAN_PRICES_BS[planType];
        if (billingCycle === 'ANNUAL') {
            const annualBase = monthlyPrice * 12;
            const discountedAnnual = annualBase * (1 - ANNUAL_DISCOUNT_PERCENT / 100);
            return Number(discountedAnnual.toFixed(2));
        }
        return monthlyPrice;
    }

    async getAll(params: IBaseParams): Promise<ServiceResponse<CompanyPaymentAttributes[]>> {
        const { rows, count } = await this.companyPaymentRepository.findAll(params);
        const plainRows = rows.map((row) => row.get({ plain: true }));

        return {
            success: true,
            data: plainRows,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / params.size),
                currentPage: params.page,
                order: params.order,
                pageSize: params.size
            }
        };
    }

    async create(body: CompanyPaymentCreationAttributes): Promise<ServiceResponse<CompanyPaymentAttributes>> {
        if (!body.uuid_company) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'uuid_company is required'
            });
        }

        const companyResponse = await this.companyService.getById({ id: body.uuid_company, includeInactive: true });
        const companyState = companyResponse.data as CompanyAttributes;
        const renewalAt = companyState.membership_renewal_at ? new Date(companyState.membership_renewal_at) : null;
        const hasActivePaidSubscription = companyState.membership_status === 'ACTIVE'
            && !!renewalAt
            && renewalAt.getTime() >= Date.now();
        if (hasActivePaidSubscription) {
            throw new ApiError({
                name: 'SubscriptionAlreadyActive',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Company already has an active paid subscription'
            });
        }

        if (!body.payment_method || !PAYMENT_METHODS.includes(body.payment_method)) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Valid payment_method is required'
            });
        }

        const amount = this.calculateActivationAmount(body.plan_type, body.billing_cycle);
        const payload: CompanyPaymentCreationAttributes = {
            ...body,
            amount,
            currency: 'BOB'
        };

        const created = await this.companyPaymentRepository.create(payload);

        const company = await CompanyModel.findOne({
            where: {
                uuid_company: body.uuid_company
            }
        });
        if (company) {
            const paidAt = new Date(body.paid_at);
            const currentRenewal = company.membership_renewal_at ? new Date(company.membership_renewal_at) : null;
            const baseDate = currentRenewal && currentRenewal > paidAt ? currentRenewal : paidAt;
            const nextRenewal = this.calculateNextRenewalDate(baseDate, body.billing_cycle);

            company.plan_type = body.plan_type;
            company.billing_cycle = body.billing_cycle;
            company.membership_status = 'ACTIVE';
            company.is_active = true;
            company.membership_started_at = company.membership_started_at ?? paidAt;
            company.membership_renewal_at = nextRenewal;
            await company.save();
        }

        return {
            success: true,
            data: created.get({ plain: true })
        };
    }

    async getById(params: { id: string; includeInactive?: boolean; uuid_company?: string }): Promise<ServiceResponse<CompanyPaymentAttributes>> {
        const row = await this.companyPaymentRepository.findById(params);
        if (!row) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Company payment not found'
            });
        }

        return {
            success: true,
            data: row.get({ plain: true })
        };
    }

    async update(
        id: string,
        body: CompanyPaymentCreationAttributes,
        tenantContext?: { uuid_company?: string }
    ): Promise<ServiceResponse<CompanyPaymentAttributes>> {
        const updated = await this.companyPaymentRepository.update(id, body, tenantContext);
        if (!updated) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Company payment not found or inactive'
            });
        }

        return {
            success: true,
            data: updated.get({ plain: true })
        };
    }

    async delete(id: string, tenantContext?: { uuid_company?: string }): Promise<ServiceResponse<null>> {
        const deleted = await this.companyPaymentRepository.delete(id, tenantContext);
        if (!deleted) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Company payment not found or inactive'
            });
        }

        return {
            success: true,
            data: null
        };
    }
}

export default CompanyPaymentService;
