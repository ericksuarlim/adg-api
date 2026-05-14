import { ServiceResponse } from "../interfaces/common/service-response.interface";
import {
    ReferenceSampleAttributes,
    ReferenceSampleCreationAttributes
} from "../interfaces/reference-sample/reference-sample.interface";
import { IBaseServiceInterface } from "../interfaces/services/base-service.interface";
import { IBaseRepository } from "../interfaces/repositories/base-repository.interface";
import ApiError from "../errors/apiError";
import HttpStatusCodes from "../errors/httpStatusCodes";
import ReferenceSampleModel from "../database/models/reference-sample.model";
import { IBaseParams } from "../interfaces/params/query.interface";

class ReferenceSampleService implements
    IBaseServiceInterface<ReferenceSampleAttributes, ReferenceSampleCreationAttributes> {

    private readonly referenceSampleRepository: IBaseRepository<
        ReferenceSampleModel,
        ReferenceSampleCreationAttributes
    >;

    constructor(
        referenceSampleRepository: IBaseRepository<ReferenceSampleModel, ReferenceSampleCreationAttributes>
    ) {
        this.referenceSampleRepository = referenceSampleRepository;
    }

    async getAll(params: IBaseParams): Promise<ServiceResponse<ReferenceSampleAttributes[]>> {
        const { rows, count } = await this.referenceSampleRepository.findAll(params);

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

    async create(body: ReferenceSampleCreationAttributes, _options?: unknown): Promise<ServiceResponse<ReferenceSampleAttributes>> {
        if (!body.title || body.title.trim() === '') {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Title is required'
            });
        }

        const created = await this.referenceSampleRepository.create(body);

        return {
            success: true,
            data: created.get({ plain: true })
        };
    }

    async getById(params: {
        id: string;
        includeInactive?: boolean;
        uuid_company?: string;
    }): Promise<ServiceResponse<ReferenceSampleAttributes>> {
        const { id, includeInactive, uuid_company } = params;

        if (!id || id.trim() === '') {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Reference sample id is required'
            });
        }

        const row = await this.referenceSampleRepository.findById({
            id,
            includeInactive,
            uuid_company
        });

        if (!row) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Reference sample not found'
            });
        }

        return {
            success: true,
            data: row.get({ plain: true })
        };
    }

    async update(
        id: string,
        body: ReferenceSampleCreationAttributes,
        tenantContext?: { uuid_company?: string }
    ): Promise<ServiceResponse<ReferenceSampleAttributes>> {
        if (!id || id.trim() === '') {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Reference sample id is required'
            });
        }

        const updated = await this.referenceSampleRepository.update(id, body, tenantContext);

        if (!updated) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Reference sample not found'
            });
        }

        return {
            success: true,
            data: updated.get({ plain: true })
        };
    }

    async delete(id: string, tenantContext?: { uuid_company?: string }): Promise<ServiceResponse<null>> {
        if (!id || id.trim() === '') {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Reference sample id is required'
            });
        }

        const deleted = await this.referenceSampleRepository.delete(id, tenantContext);

        if (!deleted) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Reference sample not found'
            });
        }

        return {
            success: true,
            data: null
        };
    }
}

export default ReferenceSampleService;
