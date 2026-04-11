import { Request, Response, NextFunction } from "express";
import {CompanyAttributes, CompanyCreationAttributes} from "../interfaces/company/company.interface";
import {
    IDeleteCompanyParams,
    IGetCompanyParams,
    IUpdateCompanyParams
} from "../interfaces/params/companyParams.interface";
import {IBaseServiceInterface} from "../interfaces/services/base-service.interface";
import { IncludeInactiveQuery } from "../interfaces/params/query.interface";
import { buildGetAllParams, buildGetByIdParams } from "../utils/query.builder";
import { handleResponse } from "../utils/response.handler";

class CompanyController {
    private companyService: IBaseServiceInterface<CompanyAttributes, CompanyCreationAttributes>;

    constructor(
        companyService: IBaseServiceInterface<CompanyAttributes, CompanyCreationAttributes>
    ) {
        this.companyService = companyService;
    }

    createCompany = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const reqBody = req.body as CompanyCreationAttributes;
            const response = await this.companyService.create(reqBody);

            return handleResponse(res, response, 201);
        } catch (error) {
            next(error);
        }
    }

    getCompany = async (
        req: Request<IGetCompanyParams, {}, {}, IncludeInactiveQuery>,
        res: Response, next: NextFunction) => 
    {
        try {
            const { uuid_company } = req.params;
            const { includeInactive } = buildGetByIdParams(req.query);

            const response = await this.companyService.getById({ id: uuid_company, includeInactive });

            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    }

    getCompanies = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const params = buildGetAllParams(req.query);

            const response = await this.companyService.getAll(params);

            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    }

    updateCompany = async (req: Request<IUpdateCompanyParams>, res: Response, next: NextFunction) => {
        try {
            const { uuid_company } = req.params;
            const reqBody = req.body as CompanyCreationAttributes;

            const response = await this.companyService.update(
                uuid_company,
                reqBody
            );

            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    }

    deleteCompany = async (req: Request<IDeleteCompanyParams>, res: Response, next: NextFunction) => {
        try {
            const { uuid_company } = req.params;
            const response = await this.companyService.delete(uuid_company);

            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    }
}

export default CompanyController;