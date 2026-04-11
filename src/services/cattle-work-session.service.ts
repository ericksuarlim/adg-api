import { ServiceResponse } from "../interfaces/common/service-response.interface";
import {
    CattleWorkSessionAttributes,
    CattleWorkSessionCreationAttributes
} from "../interfaces/work-session/cattle-work-session.interface";
import { IBaseServiceInterface } from "../interfaces/services/base-service.interface";
import { IBaseRepository } from "../interfaces/repositories/base-repository.interface";
import ApiError from "../errors/apiError";
import HttpStatusCodes from "../errors/httpStatusCodes";
import CattleWorkSessionModel from "../database/models/cattle-work-session.model";
import {Status} from "../interfaces/params/query.interface";

class CattleWorkSessionService implements
    IBaseServiceInterface<CattleWorkSessionAttributes, CattleWorkSessionCreationAttributes> {

    private repository: IBaseRepository<CattleWorkSessionModel, CattleWorkSessionCreationAttributes>;

    constructor(
        repository: IBaseRepository<CattleWorkSessionModel, CattleWorkSessionCreationAttributes>
    ) {
        this.repository = repository;
    }

    async getAll(params: {
        page: number;
        size: number;
        sortBy: string;
        order: 'ASC' | 'DESC';
        status?: Status;
    }): Promise<ServiceResponse<CattleWorkSessionAttributes[]>> {

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

    async create(
        body: CattleWorkSessionCreationAttributes
    ): Promise<ServiceResponse<CattleWorkSessionAttributes>> {

        const created = await this.repository.create(body);

        return {
            success: true,
            data: created.get({ plain: true })
        };
    }

    async getById(params: { id: string }): Promise<ServiceResponse<CattleWorkSessionAttributes>> {
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

        return {
            success: true,
            data: item.get({ plain: true })
        };
    }

    async update(
        id: string,
        body: CattleWorkSessionCreationAttributes
    ): Promise<ServiceResponse<CattleWorkSessionAttributes>> {

        if (!id || id.trim() === '') {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Work session ID is required'
            });
        }

        const updated = await this.repository.update(id, body);

        if (!updated) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Work session not found'
            });
        }

        return {
            success: true,
            data: updated.get({ plain: true })
        };
    }

    async delete(id: string): Promise<ServiceResponse<null>> {
        if (!id || id.trim() === '') {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Work session ID is required'
            });
        }

        const deleted = await this.repository.delete(id);

        if (!deleted) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Work session not found'
            });
        }

        return {
            success: true,
            data: null
        };
    }
}

export default CattleWorkSessionService;