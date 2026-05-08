import { ServiceResponse } from "../interfaces/common/service-response.interface";
import { AnimalAttributes, AnimalCreationAttributes } from "../interfaces/animal/animal.interface";
import { IBaseServiceInterface } from "../interfaces/services/base-service.interface";
import { IBaseRepository } from "../interfaces/repositories/base-repository.interface";
import ApiError from "../errors/apiError";
import HttpStatusCodes from "../errors/httpStatusCodes";
import AnimalModel from "../database/models/animal.model";
import { IBaseParams } from "../interfaces/params/query.interface";
import RanchModel from "../database/models/ranch.model";

class AnimalService implements IBaseServiceInterface<AnimalAttributes, AnimalCreationAttributes> {

    private readonly animalRepository: IBaseRepository<AnimalModel, AnimalCreationAttributes>;

    constructor(
        animalRepository: IBaseRepository<AnimalModel, AnimalCreationAttributes>
    ) {
        this.animalRepository = animalRepository;
    }

    private async validateRanchBelongsToCompany(
        uuidRanch: string | null | undefined,
        tenantContext?: { uuid_company?: string }
    ): Promise<void> {
        if (!uuidRanch) {
            return;
        }

        const ranch = await RanchModel.findOne({
            where: { uuid_ranch: uuidRanch, is_active: true }
        });
        if (!ranch) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Ranch not found'
            });
        }

        const tenantCompany = tenantContext?.uuid_company;
        if (tenantCompany && ranch.uuid_company !== tenantCompany) {
            throw new ApiError({
                name: 'Forbidden',
                statusCode: HttpStatusCodes.FORBIDDEN,
                description: 'Animal ranch does not belong to authenticated company'
            });
        }
    }

    async getAll(params: IBaseParams): Promise<ServiceResponse<AnimalAttributes[]>> {
        const { rows, count } = await this.animalRepository.findAll(params);
        const plainAnimals = rows.map((animal) => animal.get({ plain: true }));
        return {
            success: true,
            data: plainAnimals,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / params.size),
                currentPage: params.page,
                order: params.order,
                pageSize: params.size
            }
        };
    }

    async create(animalBody: AnimalCreationAttributes): Promise<ServiceResponse<AnimalAttributes>> {
        await this.validateRanchBelongsToCompany(animalBody.ranch_uuid);
        const animal = await this.animalRepository.create(animalBody);
        return { success: true, data: animal.get({ plain: true }) };
    }

    async getById(params: { id: string; includeInactive?: boolean; uuid_company?: string }): Promise<ServiceResponse<AnimalAttributes>> {
        const { id, includeInactive, uuid_company } = params;
        if (!id || id.trim() === '') {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Animal ID is required'
            });
        }

        const animal = await this.animalRepository.findById({ id, includeInactive, uuid_company });
        if (!animal) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Animal not found'
            });
        }

        return { success: true, data: animal.get({ plain: true }) };
    }

    async update(
        id: string,
        animalBody: AnimalCreationAttributes,
        tenantContext?: { uuid_company?: string }
    ): Promise<ServiceResponse<AnimalAttributes>> {
        if (!id || id.trim() === '') {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Animal ID is required'
            });
        }

        const current = await this.animalRepository.findById({ id, includeInactive: false });
        if (!current) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Animal not found'
            });
        }

        await this.validateRanchBelongsToCompany(current.ranch_uuid, tenantContext);
        await this.validateRanchBelongsToCompany(animalBody.ranch_uuid ?? current.ranch_uuid, tenantContext);

        const updated = await this.animalRepository.update(id, animalBody, tenantContext);
        if (!updated) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Animal not found'
            });
        }

        return { success: true, data: updated.get({ plain: true }) };
    }

    async delete(id: string, tenantContext?: { uuid_company?: string }): Promise<ServiceResponse<null>> {
        if (!id || id.trim() === '') {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Animal ID is required'
            });
        }

        const deleted = await this.animalRepository.delete(id, tenantContext);
        if (!deleted) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Animal not found'
            });
        }

        return { success: true, data: null };
    }
}

export default AnimalService;
