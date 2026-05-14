import { ServiceResponse } from "../interfaces/common/service-response.interface";
import { AnimalAttributes, AnimalCreationAttributes } from "../interfaces/animal/animal.interface";
import { IBaseServiceInterface } from "../interfaces/services/base-service.interface";
import ApiError from "../errors/apiError";
import HttpStatusCodes from "../errors/httpStatusCodes";
import { IBaseParams } from "../interfaces/params/query.interface";
import RanchModel from "../database/models/ranch.model";
import AnimalRepository from "../repositories/animal.repository";
import { CompanyAttributes, CompanyCreationAttributes } from "../interfaces/company/company.interface";
import { normalizeCompanyPlanType, PLAN_HEAD_LIMIT } from "../constants/subscription.constants";

class AnimalService implements IBaseServiceInterface<AnimalAttributes, AnimalCreationAttributes> {

    private readonly animalRepository: AnimalRepository;
    private readonly companyService: IBaseServiceInterface<CompanyAttributes, CompanyCreationAttributes>;

    constructor(
        animalRepository: AnimalRepository,
        companyService: IBaseServiceInterface<CompanyAttributes, CompanyCreationAttributes>
    ) {
        this.animalRepository = animalRepository;
        this.companyService = companyService;
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
        const uuidCompany = animalBody.uuid_company;
        if (!uuidCompany || uuidCompany.trim() === '') {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'uuid_company is required to create an animal'
            });
        }

        await this.validateRanchBelongsToCompany(animalBody.ranch_uuid, { uuid_company: uuidCompany });

        const companyResponse = await this.companyService.getById({ id: uuidCompany, includeInactive: true });
        if (!companyResponse.success || !companyResponse.data) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Company not found'
            });
        }

        const plan = normalizeCompanyPlanType(companyResponse.data.plan_type);
        const headLimit = PLAN_HEAD_LIMIT[plan];
        const currentHeads = await this.animalRepository.countActiveByCompany(uuidCompany);
        if (currentHeads >= headLimit) {
            throw new ApiError({
                name: 'PlanAnimalHeadLimitReached',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: `Animal head limit reached for this company (${headLimit} heads for plan ${plan})`
            });
        }

        const animal = await this.animalRepository.create(animalBody);
        return { success: true, data: animal.get({ plain: true }) };
    }

    async getById(params: {
        id: string;
        includeInactive?: boolean;
        uuid_company?: string;
        uuid_ranch_in?: string[];
    }): Promise<ServiceResponse<AnimalAttributes>> {
        const { id, includeInactive, uuid_company, uuid_ranch_in } = params;
        if (!id || id.trim() === '') {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Animal ID is required'
            });
        }

        const animal = await this.animalRepository.findById({ id, includeInactive, uuid_company, uuid_ranch_in });
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
        tenantContext?: { uuid_company?: string; uuid_ranch_in?: string[] }
    ): Promise<ServiceResponse<AnimalAttributes>> {
        if (!id || id.trim() === '') {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Animal ID is required'
            });
        }

        const current = await this.animalRepository.findById({
            id,
            includeInactive: false,
            uuid_company: tenantContext?.uuid_company,
            uuid_ranch_in: tenantContext?.uuid_ranch_in,
        });
        if (!current) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Animal not found'
            });
        }

        const effectiveTenant = {
            uuid_company: tenantContext?.uuid_company ?? (current.get("uuid_company") as string),
            uuid_ranch_in: tenantContext?.uuid_ranch_in,
        };

        await this.validateRanchBelongsToCompany(current.ranch_uuid, effectiveTenant);
        await this.validateRanchBelongsToCompany(animalBody.ranch_uuid ?? current.ranch_uuid, effectiveTenant);

        const updated = await this.animalRepository.update(id, animalBody);
        if (!updated) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Animal not found'
            });
        }

        return { success: true, data: updated.get({ plain: true }) };
    }

    async delete(id: string, tenantContext?: { uuid_company?: string; uuid_ranch_in?: string[] }): Promise<ServiceResponse<null>> {
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
