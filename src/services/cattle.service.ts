import { ServiceResponse } from "../interfaces/common/service-response.interface";
import { CattleAttributes, CattleCreationAttributes } from "../interfaces/cattle/cattle.interface";
import { IBaseServiceInterface } from "../interfaces/services/base-service.interface";
import { IBaseRepository } from "../interfaces/repositories/base-repository.interface";
import ApiError from "../errors/apiError";
import HttpStatusCodes from "../errors/httpStatusCodes";
import Cattle from "../database/models/cattle.model";
import {IBaseParams} from "../interfaces/params/query.interface";

class CattleService implements IBaseServiceInterface<CattleAttributes, CattleCreationAttributes> {

    private readonly cattleRepository: IBaseRepository<Cattle, CattleCreationAttributes>;

    constructor(
        cattleRepository: IBaseRepository<Cattle, CattleCreationAttributes>
    ) {
        this.cattleRepository = cattleRepository;
    }

    async getAll(params: IBaseParams): Promise<ServiceResponse<CattleAttributes[]>> {

        const { rows, count } = await this.cattleRepository.findAll(params);

        const plainCattle = rows.map(cattle => cattle.get({ plain: true }));

        return {
            success: true,
            data: plainCattle,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / params.size),
                currentPage: params.page,
                order: params.order,
                pageSize: params.size
            }
        };
    }

    async create(cattleBody: CattleCreationAttributes): Promise<ServiceResponse<CattleAttributes>> {
        const cattle = await this.cattleRepository.create(cattleBody);

        return {
            success: true,
            data: cattle.get({ plain: true })
        };
    }

    async getById(params: { id: string }): Promise<ServiceResponse<CattleAttributes>> {
        const { id } = params;

        if (!id || id.trim() === '') {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Cattle ID is required'
            });
        }

        const cattle = await this.cattleRepository.findById({ id });

        if (!cattle) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Cattle not found'
            });
        }

        return {
            success: true,
            data: cattle.get({ plain: true })
        };
    }

    async update(
        id: string,
        cattleBody: CattleCreationAttributes,
        tenantContext?: { uuid_company?: string }
    ): Promise<ServiceResponse<CattleAttributes>> {
        if (!id || id.trim() === '') {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Cattle ID is required'
            });
        }

        const updated = await this.cattleRepository.update(id, cattleBody, tenantContext);

        if (!updated) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Cattle not found'
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
                description: 'Cattle ID is required'
            });
        }

        const deleted = await this.cattleRepository.delete(id, tenantContext);

        if (!deleted) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Cattle not found'
            });
        }

        return {
            success: true,
            data: null
        };
    }
}

export default CattleService;