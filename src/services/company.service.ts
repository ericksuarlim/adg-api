import { CompanyAttributes, CompanyCreationAttributes } from "../interfaces/company/company.interface";
import { ServiceResponse } from "../interfaces/common/service-response.interface";
import { IBaseServiceInterface } from "../interfaces/services/base-service.interface";
import { IBaseRepository } from "../interfaces/repositories/base-repository.interface";
import ApiError from "../errors/apiError";
import HttpStatusCodes from "../errors/httpStatusCodes";
import { CompanyModel } from "../database/models";
import {IBaseParams} from "../interfaces/params/query.interface";

class CompanyService implements IBaseServiceInterface<CompanyAttributes, CompanyCreationAttributes> {

    private readonly companyRepository: IBaseRepository<CompanyModel, CompanyCreationAttributes>;

    constructor(
        companyRepository: IBaseRepository<CompanyModel, CompanyCreationAttributes>,
    ) {
        this.companyRepository = companyRepository;
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
        const company = await this.companyRepository.create(companyBody);

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

        const updatedCompany = await this.companyRepository.update(uuid_company, companyBody, tenantContext);

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
}

export default CompanyService;