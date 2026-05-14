import { ServiceResponse } from "../interfaces/common/service-response.interface";
import {
    AnimalWorkSessionAttributes,
    AnimalWorkSessionCreationAttributes
} from "../interfaces/work-session/animal-work-session.interface";
import { IBaseServiceInterface } from "../interfaces/services/base-service.interface";
import { IBaseRepository } from "../interfaces/repositories/base-repository.interface";
import ApiError from "../errors/apiError";
import HttpStatusCodes from "../errors/httpStatusCodes";
import type { Model } from "sequelize";
import { IBaseParams } from "../interfaces/params/query.interface";

class AnimalWorkSessionService implements
    IBaseServiceInterface<AnimalWorkSessionAttributes, AnimalWorkSessionCreationAttributes> {

    private readonly repository: IBaseRepository<Model<AnimalWorkSessionAttributes, AnimalWorkSessionCreationAttributes>, AnimalWorkSessionCreationAttributes>;

    constructor(
        repository: IBaseRepository<Model<AnimalWorkSessionAttributes, AnimalWorkSessionCreationAttributes>, AnimalWorkSessionCreationAttributes>
    ) {
        this.repository = repository;
    }

    async getAll(params: IBaseParams): Promise<ServiceResponse<AnimalWorkSessionAttributes[]>> {
        const { rows, count } = await this.repository.findAll(params);
        const plainRows = rows.map(item => item.get({ plain: true }));
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

    async create(body: AnimalWorkSessionCreationAttributes, _options?: unknown): Promise<ServiceResponse<AnimalWorkSessionAttributes>> {
        const created = await this.repository.create(body);
        return { success: true, data: created.get({ plain: true }) };
    }

    async getById(params: { id: string }): Promise<ServiceResponse<AnimalWorkSessionAttributes>> {
        const { id } = params;
        if (!id || id.trim() === '') {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Work session ID is required'
            });
        }

        const item = await this.repository.findById({ id });
        if (!item) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Work session not found'
            });
        }

        return { success: true, data: item.get({ plain: true }) };
    }

    async update(
        id: string,
        body: AnimalWorkSessionCreationAttributes,
        tenantContext?: { uuid_company?: string }
    ): Promise<ServiceResponse<AnimalWorkSessionAttributes>> {
        if (!id || id.trim() === '') {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Work session ID is required'
            });
        }

        const updated = await this.repository.update(id, body, tenantContext);
        if (!updated) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Work session not found'
            });
        }
        return { success: true, data: updated.get({ plain: true }) };
    }

    async delete(id: string, tenantContext?: { uuid_company?: string }): Promise<ServiceResponse<null>> {
        if (!id || id.trim() === '') {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Work session ID is required'
            });
        }
        const deleted = await this.repository.delete(id, tenantContext);
        if (!deleted) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Work session not found'
            });
        }
        return { success: true, data: null };
    }
}

export default AnimalWorkSessionService;
