import { Request, Response, NextFunction } from "express";
import { CompanyCreationAttributes } from "../interfaces/company/company.interface";
import {
    IDeleteCompanyParams,
    IGetCompanyParams,
    IUpdateCompanyParams
} from "../interfaces/params/companyParams.interface";
import { IncludeInactiveQuery } from "../interfaces/params/query.interface";
import { buildGetAllParams, buildGetByIdParams } from "../utils/query.builder";
import { handleResponse } from "../utils/response.handler";
import { ICompanyOnboardingService } from "../interfaces/services/company-onboarding-service.interface";
import { CompanyOnboardingData } from "../interfaces/company/company-onboarding.interface";
import { AuthRequest } from "../interfaces/middleware/auth-middleware.interface";
import { UserRole } from "../interfaces/roles/roles.interface";
import CompanyService from "../services/company.service";

class CompanyController {
    private readonly companyService: CompanyService;
    private readonly companyOnboardingService: ICompanyOnboardingService;

    constructor(
        companyService: CompanyService,
        companyOnboardingService: ICompanyOnboardingService
    ) {
        this.companyService = companyService;
        this.companyOnboardingService = companyOnboardingService;
    }

    private isSaasOwner(req: AuthRequest): boolean {
        return (req.user?.roles ?? []).includes(UserRole.SAAS_OWNER);
    }

    createCompany = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const reqBody = req.body as CompanyCreationAttributes;
            const response = await this.companyService.create(reqBody);

            return handleResponse(res, response, 201);
        } catch (error) {
            next(error);
        }
    }

    onboardCompanyWithOwner = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const reqBody = req.body as CompanyOnboardingData;
            const response = await this.companyOnboardingService.onboardCompany(reqBody);

            return handleResponse(res, response, 201);
        } catch (error) {
            next(error);
        }
    }

    getCompany = async (
        req: AuthRequest & Request<IGetCompanyParams, {}, {}, IncludeInactiveQuery>,
        res: Response, next: NextFunction) => 
    {
        try {
            const { uuid_company } = req.params;
            const { includeInactive } = buildGetByIdParams(req.query);

            const tenantCompany = this.isSaasOwner(req) ? undefined : req.user?.uuid_company;
            const response = await this.companyService.getById({
                id: uuid_company,
                includeInactive,
                uuid_company: tenantCompany
            });

            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    }

    getCompanies = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const params = buildGetAllParams(req.query);
            params.uuid_company = this.isSaasOwner(req) ? undefined : req.user?.uuid_company;

            const response = await this.companyService.getAll(params);

            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    }

    updateCompany = async (req: AuthRequest & Request<IUpdateCompanyParams>, res: Response, next: NextFunction) => {
        try {
            const { uuid_company } = req.params;
            const reqBody = req.body as CompanyCreationAttributes;

            const tenantCompany = this.isSaasOwner(req) ? undefined : req.user?.uuid_company;
            const response = await this.companyService.update(
                uuid_company,
                reqBody,
                { uuid_company: tenantCompany }
            );

            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    }

    deleteCompany = async (req: AuthRequest & Request<IDeleteCompanyParams>, res: Response, next: NextFunction) => {
        try {
            const { uuid_company } = req.params;
            const tenantCompany = this.isSaasOwner(req) ? undefined : req.user?.uuid_company;
            const response = await this.companyService.delete(uuid_company, { uuid_company: tenantCompany });

            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    }

    endCompanySubscription = async (req: AuthRequest & Request<IUpdateCompanyParams>, res: Response, next: NextFunction) => {
        try {
            const { uuid_company } = req.params;
            const tenantCompany = this.isSaasOwner(req) ? undefined : req.user?.uuid_company;
            const response = await this.companyService.endSubscription(uuid_company, { uuid_company: tenantCompany });

            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    }

    reactivateCompany = async (req: AuthRequest & Request<IUpdateCompanyParams>, res: Response, next: NextFunction) => {
        try {
            const { uuid_company } = req.params;
            const tenantCompany = this.isSaasOwner(req) ? undefined : req.user?.uuid_company;
            const response = await this.companyService.reactivate(uuid_company, { uuid_company: tenantCompany });

            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    }

    activateTrial = async (
        req: AuthRequest & Request<IUpdateCompanyParams>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { uuid_company } = req.params;
            const { trial_start_date, trial_end_date } = req.body as { trial_start_date: string; trial_end_date: string };
            const tenantCompany = this.isSaasOwner(req) ? undefined : req.user?.uuid_company;
            const response = await this.companyService.activateTrial(
                uuid_company,
                trial_start_date,
                trial_end_date,
                { uuid_company: tenantCompany }
            );

            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    }
}

export default CompanyController;