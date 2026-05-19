import { RanchAttributes, RanchCreationAttributes } from "../interfaces/ranch/ranch.interface";
import { ServiceResponse } from "../interfaces/common/service-response.interface";
import { IBaseServiceInterface } from "../interfaces/services/base-service.interface";
import { IBaseRepository } from "../interfaces/repositories/base-repository.interface";
import ApiError from "../errors/apiError";
import HttpStatusCodes from "../errors/httpStatusCodes";
import type { Model } from "sequelize";
import PaddockRepository from "../repositories/paddock.repository";
import { RanchCompanyRouteModel } from "../database/models";

type RanchRow = Model<RanchAttributes, RanchCreationAttributes>;

class RanchService implements IBaseServiceInterface<RanchAttributes, RanchCreationAttributes> {

    private readonly ranchRepository: IBaseRepository<RanchRow, RanchCreationAttributes>;
    private readonly paddockRepository: PaddockRepository;

    constructor(
        ranchRepository: IBaseRepository<RanchRow, RanchCreationAttributes>,
        paddockRepository?: PaddockRepository
    ) {
        this.ranchRepository = ranchRepository;
        this.paddockRepository = paddockRepository ?? new PaddockRepository();
    }

    async getAll(params: {
        page: number;
        size: number;
        sortBy: string;
        order: 'ASC' | 'DESC';
        is_active?: boolean;
        status?: 'all' | 'active' | 'inactive';
        uuid_company?: string;
        uuid_ranch_in?: string[];
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

    async create(ranchBody: RanchCreationAttributes, _options?: unknown): Promise<ServiceResponse<RanchAttributes>> {
        const ranch = await this.ranchRepository.create(ranchBody);
        const plain = ranch.get({ plain: true }) as RanchAttributes;
        await RanchCompanyRouteModel.create({
            uuid_ranch: plain.uuid_ranch,
            uuid_company: plain.uuid_company,
        });

        return {
            success: true,
            data: plain
        };
    }

    async getById(params: {
        id: string;
        includeInactive?: boolean;
        uuid_company?: string;
        uuid_ranch_in?: string[];
    }): Promise<ServiceResponse<RanchAttributes>> {
        const { id: uuid_ranch, includeInactive, uuid_company, uuid_ranch_in } = params;

        if (!uuid_ranch || uuid_ranch.trim() === '') {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'uuid_ranch is required'
            });
        }

        const ranch = await this.ranchRepository.findById({ id: uuid_ranch, includeInactive, uuid_company, uuid_ranch_in });

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

    async update(
        uuid_ranch: string,
        ranchBody: RanchCreationAttributes,
        tenantContext?: { uuid_company?: string }
    ): Promise<ServiceResponse<RanchAttributes>> {
        if (!uuid_ranch || uuid_ranch.trim() === '') {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'uuid_ranch is required'
            });
        }

        const updatedRanch = await this.ranchRepository.update(uuid_ranch, ranchBody, tenantContext);

        if (!updatedRanch) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Problem updating ranch'
            });
        }

        return {
            success: true,
            data: updatedRanch.get({ plain: true })
        };
    }

    async delete(uuid_ranch: string, tenantContext?: { uuid_company?: string }): Promise<ServiceResponse<null>> {
        if (!uuid_ranch || uuid_ranch.trim() === '') {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'uuid_ranch is required'
            });
        }

        const deleted = await this.ranchRepository.delete(uuid_ranch, tenantContext);

        if (!deleted) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Ranch not found or already inactive'
            });
        }

        await RanchCompanyRouteModel.destroy({ where: { uuid_ranch } });

        return {
            success: true,
            data: null
        };
    }

    async listActivePaddocks(params: {
        uuid_ranch: string;
        uuid_company?: string;
        uuid_ranch_in?: string[];
    }): Promise<
        ServiceResponse<
            {
                paddock_uuid: string;
                name: string;
                size_in_hectares: number | null;
                grass_type: string | null;
                water_source: string | null;
                maximum_capacity: number | null;
            }[]
        >
    > {
        const gate = await this.getById({
            id: params.uuid_ranch,
            includeInactive: false,
            uuid_company: params.uuid_company,
            uuid_ranch_in: params.uuid_ranch_in,
        });
        if (!gate.success || !gate.data) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Ranch not found'
            });
        }
        const rows = await this.paddockRepository.findActiveByRanch(params.uuid_ranch);
        return {
            success: true,
            data: rows.map((row) => ({
                paddock_uuid: row.paddock_uuid,
                name: row.name,
                size_in_hectares: row.size_in_hectares ?? null,
                grass_type: row.grass_type ?? null,
                water_source: row.water_source ?? null,
                maximum_capacity: row.maximum_capacity ?? null,
            })),
        };
    }
}

export default RanchService;