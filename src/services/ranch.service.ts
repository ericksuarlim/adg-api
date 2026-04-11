import { RanchAttributes, RanchCreationAttributes } from "../interfaces/ranch/ranch.interface";
import { ServiceResponse } from "../interfaces/common/service-response.interface";
import { IBaseServiceInterface } from "../interfaces/services/base-service.interface";
import { IBaseRepository } from "../interfaces/repositories/base-repository.interface";
import ApiError from "../errors/apiError";
import HttpStatusCodes from "../errors/httpStatusCodes";
import { RanchModel } from "../database/models";

class RanchService implements IBaseServiceInterface<RanchAttributes, RanchCreationAttributes> {

    private ranchRepository: IBaseRepository<RanchModel, RanchCreationAttributes>;

    constructor(ranchRepository: IBaseRepository<RanchModel, RanchCreationAttributes>) {
        this.ranchRepository = ranchRepository;
    }

    async getAll(params: {
        page: number;
        size: number;
        sortBy: string;
        order: 'ASC' | 'DESC';
        is_active?: boolean;
    }): Promise<ServiceResponse<RanchAttributes[]>> {

        const {rows, count} = await this.ranchRepository.findAll(params);

        const plainRanches = rows.map(ranch => ranch.get({ plain: true }));

        return {
            success: true,
            data: plainRanches,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / params.size),
                currentPage: params.page,
                order: params.order,
                pageSize: params.size
            }
        };
    }

    async create(ranchBody: RanchCreationAttributes): Promise<ServiceResponse<RanchAttributes>> {
        const ranch = await this.ranchRepository.create(ranchBody);

        return {
            success: true,
            data: ranch.get({ plain: true })
        };
    }

    async getById(params: { id: string; includeInactive?: boolean }): Promise<ServiceResponse<RanchAttributes>> {
        const { id: uuid_ranch, includeInactive } = params;

        if (!uuid_ranch || uuid_ranch.trim() === '') {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'uuid_ranch is required'
            });
        }

        const ranch = await this.ranchRepository.findById({ id: uuid_ranch, includeInactive });

        if (!ranch) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Ranch not found'
            });
        }

        return {
            success: true,
            data: ranch.get({ plain: true })
        };
    }

    async update(uuid_ranch: string, ranchBody: RanchCreationAttributes): Promise<ServiceResponse<RanchAttributes>> {
        if (!uuid_ranch || uuid_ranch.trim() === '') {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'uuid_ranch is required'
            });
        }

        const updatedRanch = await this.ranchRepository.update(uuid_ranch, ranchBody);

        if (!updatedRanch) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Ranch not found or inactive'
            });
        }

        return {
            success: true,
            data: updatedRanch.get({ plain: true })
        };
    }

    async delete(uuid_ranch: string): Promise<ServiceResponse<null>> {
        if (!uuid_ranch || uuid_ranch.trim() === '') {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'uuid_ranch is required'
            });
        }

        const deleted = await this.ranchRepository.delete(uuid_ranch);

        if (!deleted) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Ranch not found or already inactive'
            });
        }

        return {
            success: true,
            data: null
        };
    }
}

export default RanchService;