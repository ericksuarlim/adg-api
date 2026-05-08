import { NextFunction, Response, Request } from "express";
import { IBaseServiceInterface } from "../interfaces/services/base-service.interface";
import {
    CompanyPaymentAttributes,
    CompanyPaymentCreationAttributes
} from "../interfaces/company/company-payment.interface";
import { AuthRequest } from "../interfaces/middleware/auth-middleware.interface";
import { handleResponse } from "../utils/response.handler";
import { buildGetAllParams, buildGetByIdParams } from "../utils/query.builder";
import { IBaseParams, IncludeInactiveQuery } from "../interfaces/params/query.interface";
import {
    ICreateCompanyPaymentParams,
    IDeleteCompanyPaymentParams,
    IGetCompanyPaymentParams,
    IUpdateCompanyPaymentParams
} from "../interfaces/params/companyPaymentParams.interface";
import { UserRole } from "../interfaces/roles/roles.interface";

class CompanyPaymentController {
    private readonly companyPaymentService: IBaseServiceInterface<CompanyPaymentAttributes, CompanyPaymentCreationAttributes>;

    constructor(companyPaymentService: IBaseServiceInterface<CompanyPaymentAttributes, CompanyPaymentCreationAttributes>) {
        this.companyPaymentService = companyPaymentService;
    }

    private isSaasOwner(req: AuthRequest): boolean {
        return (req.user?.roles ?? []).includes(UserRole.SAAS_OWNER);
    }

    getCompanyPayments = async (req: AuthRequest & Request<ICreateCompanyPaymentParams>, res: Response, next: NextFunction) => {
        try {
            const params: IBaseParams = buildGetAllParams(req.query);
            const tenantScope = this.isSaasOwner(req) ? req.params.uuid_company : req.user?.uuid_company;
            params.uuid_company = tenantScope;
            const response = await this.companyPaymentService.getAll(params);
            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    }

    getCompanyPayment = async (
        req: AuthRequest & Request<IGetCompanyPaymentParams, {}, {}, IncludeInactiveQuery>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { includeInactive } = buildGetByIdParams(req.query);
            const tenantScope = this.isSaasOwner(req) ? req.params.uuid_company : req.user?.uuid_company;
            const response = await this.companyPaymentService.getById({
                id: req.params.uuid_company_payment,
                includeInactive,
                uuid_company: tenantScope
            });
            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    }

    createCompanyPayment = async (req: AuthRequest & Request<ICreateCompanyPaymentParams>, res: Response, next: NextFunction) => {
        try {
            const body = req.body as CompanyPaymentCreationAttributes;
            body.uuid_company = this.isSaasOwner(req) ? req.params.uuid_company : (req.user?.uuid_company as string);
            const response = await this.companyPaymentService.create(body);
            return handleResponse(res, response, 201);
        } catch (error) {
            next(error);
        }
    }

    updateCompanyPayment = async (req: AuthRequest & Request<IUpdateCompanyPaymentParams>, res: Response, next: NextFunction) => {
        try {
            const body = req.body as CompanyPaymentCreationAttributes;
            const tenantScope = this.isSaasOwner(req) ? req.params.uuid_company : req.user?.uuid_company;
            body.uuid_company = tenantScope as string;
            const response = await this.companyPaymentService.update(
                req.params.uuid_company_payment,
                body,
                { uuid_company: tenantScope }
            );
            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    }

    deleteCompanyPayment = async (req: AuthRequest & Request<IDeleteCompanyPaymentParams>, res: Response, next: NextFunction) => {
        try {
            const tenantScope = this.isSaasOwner(req) ? req.params.uuid_company : req.user?.uuid_company;
            const response = await this.companyPaymentService.delete(req.params.uuid_company_payment, {
                uuid_company: tenantScope
            });
            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    }
}

export default CompanyPaymentController;
