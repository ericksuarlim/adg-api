import { ServiceResponse } from "../interfaces/common/service-response.interface";
import { AnimalAttributes, AnimalCreationAttributes, AnimalSex } from "../interfaces/animal/animal.interface";
import { AnimalWriteRequestBody } from "../interfaces/animal/animal-registration.interface";
import { IBaseServiceInterface } from "../interfaces/services/base-service.interface";
import ApiError from "../errors/apiError";
import HttpStatusCodes from "../errors/httpStatusCodes";
import { IBaseParams } from "../interfaces/params/query.interface";
import AnimalRepository from "../repositories/animal.repository";
import { CompanyAttributes, CompanyCreationAttributes } from "../interfaces/company/company.interface";
import { normalizeCompanyPlanType, PLAN_HEAD_LIMIT } from "../constants/subscription.constants";
import { isValidCattleBreedCode } from "../constants/cattle-breed.constants";
import PaddockRepository from "../repositories/paddock.repository";
import OwnerRepository from "../repositories/owner.repository";
import { RanchAttributes, RanchCreationAttributes } from "../interfaces/ranch/ranch.interface";
import { requireTenantModels } from "../database/tenant/tenant-request-context";
import type { Model } from "sequelize";

export type AnimalCreateContext = {
    jwtCompanyUuid?: string;
    isSaasOwner: boolean;
};

type RanchRow = Model<RanchAttributes, RanchCreationAttributes>;

class AnimalService implements IBaseServiceInterface<AnimalAttributes, AnimalCreationAttributes> {

    private readonly animalRepository: AnimalRepository;
    private readonly companyService: IBaseServiceInterface<CompanyAttributes, CompanyCreationAttributes>;
    private readonly paddockRepository: PaddockRepository;
    private readonly ownerRepository: OwnerRepository;

    constructor(
        animalRepository: AnimalRepository,
        companyService: IBaseServiceInterface<CompanyAttributes, CompanyCreationAttributes>,
        paddockRepository?: PaddockRepository,
        ownerRepository?: OwnerRepository,
    ) {
        this.animalRepository = animalRepository;
        this.companyService = companyService;
        this.paddockRepository = paddockRepository ?? new PaddockRepository();
        this.ownerRepository = ownerRepository ?? new OwnerRepository();
    }

    private async validateRanchBelongsToCompany(
        uuidRanch: string | null | undefined,
        tenantContext?: { uuid_company?: string }
    ): Promise<void> {
        if (!uuidRanch) {
            return;
        }

        const { RanchModel } = requireTenantModels();
        const ranch = await RanchModel.findOne({
            where: { uuid_ranch: uuidRanch, is_active: true }
        }) as RanchRow | null;
        if (!ranch) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Ranch not found'
            });
        }

        const ranchPlain = ranch.get({ plain: true }) as RanchAttributes;

        const tenantCompany = tenantContext?.uuid_company;
        if (tenantCompany && ranchPlain.uuid_company !== tenantCompany) {
            throw new ApiError({
                name: 'Forbidden',
                statusCode: HttpStatusCodes.FORBIDDEN,
                description: 'Animal ranch does not belong to authenticated company'
            });
        }
    }

    private async resolveTenantCompanyForRanch(
        ranchUuid: string,
        ctx: AnimalCreateContext
    ): Promise<string> {
        const { RanchModel } = requireTenantModels();
        const ranch = await RanchModel.findOne({
            where: { uuid_ranch: ranchUuid, is_active: true }
        }) as RanchRow | null;
        if (!ranch) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Ranch not found'
            });
        }
        if (!ctx.isSaasOwner) {
            const ranchPlain = ranch.get({ plain: true }) as RanchAttributes;
            if (ranchPlain.uuid_company !== ctx.jwtCompanyUuid) {
                throw new ApiError({
                    name: 'Forbidden',
                    statusCode: HttpStatusCodes.FORBIDDEN,
                    description: 'Ranch does not belong to authenticated company'
                });
            }
        }
        return (ranch.get({ plain: true }) as RanchAttributes).uuid_company as string;
    }

    private async resolveParentUuidByRegistration(
        ranchUuid: string,
        registrationRaw: string,
        expectedSex: AnimalSex
    ): Promise<string> {
        const registration_number = registrationRaw.trim();
        if (!registration_number) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: `Parent registration number is empty (${expectedSex})`
            });
        }
        const parentUuid = await this.animalRepository.findActiveUuidByRanchRegistrationAndSex(
            ranchUuid,
            registration_number,
            expectedSex
        );
        if (!parentUuid) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: `No ${expectedSex} animal found with registration "${registration_number}" in this ranch`
            });
        }
        return parentUuid;
    }

    /**
     * Accepts `YYYY` (stored as Jan 1 UTC) or `YYYY-MM-DD` (UTC calendar date).
     * Rejects null/empty and out-of-range years.
     */
    private assertNormalizedBirthDate(raw: unknown): Date {
        if (raw === null || raw === undefined) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'birth_date is required',
            });
        }
        if (raw instanceof Date) {
            if (Number.isNaN(raw.getTime())) {
                throw new ApiError({
                    name: 'ValidationError',
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    description: 'Invalid birth_date',
                });
            }
            return this.assertBirthYearInRangeUtc(
                Date.UTC(raw.getUTCFullYear(), raw.getUTCMonth(), raw.getUTCDate())
            );
        }
        const s0 = String(raw).trim();
        if (!s0) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'birth_date is required',
            });
        }
        const s = /^\d{4}-\d{2}-\d{2}T/.test(s0) ? s0.slice(0, 10) : s0;
        let y: number;
        let mo = 1;
        let da = 1;
        const yearOnly = /^(\d{4})$/;
        const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/;
        let m = yearOnly.exec(s);
        if (m) {
            y = Number(m[1]);
        } else {
            m = isoDate.exec(s);
            if (!m) {
                throw new ApiError({
                    name: 'ValidationError',
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    description: 'birth_date must be a four-digit year (YYYY) or calendar date (YYYY-MM-DD)',
                });
            }
            y = Number(m[1]);
            mo = Number(m[2]);
            da = Number(m[3]);
        }
        const utcMs = Date.UTC(y, mo - 1, da);
        const utc = new Date(utcMs);
        if (utc.getUTCFullYear() !== y || utc.getUTCMonth() !== mo - 1 || utc.getUTCDate() !== da) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Invalid birth_date',
            });
        }
        return this.assertBirthYearInRangeUtc(utcMs);
    }

    private assertBirthYearInRangeUtc(utcMs: number): Date {
        const y = new Date(utcMs).getUTCFullYear();
        const maxY = new Date().getUTCFullYear() + 1;
        if (y < 1900 || y > maxY) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: `birth_date year must be between 1900 and ${maxY}`,
            });
        }
        return new Date(utcMs);
    }

    async getAll(params: IBaseParams): Promise<ServiceResponse<AnimalAttributes[]>> {
        const { rows, count } = await this.animalRepository.findAll(params);
        const plainAnimals = rows.map((animal: Model<AnimalAttributes, AnimalCreationAttributes>) => animal.get({ plain: true }));
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

    async create(
        animalBody: AnimalCreationAttributes,
        createContext?: AnimalCreateContext
    ): Promise<ServiceResponse<AnimalAttributes>> {
        const body = animalBody as AnimalWriteRequestBody;
        const ranchUuid = body.ranch_uuid?.trim();
        if (!ranchUuid) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'ranch_uuid is required'
            });
        }

        const ctx: AnimalCreateContext = createContext ?? { isSaasOwner: false };
        const tenantCompany = await this.resolveTenantCompanyForRanch(ranchUuid, ctx);

        const registration_number = body.registration_number?.trim();
        if (!registration_number) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'registration_number is required'
            });
        }

        const duplicate = await this.animalRepository.findAnimalUuidByRanchAndRegistration(
            ranchUuid,
            registration_number
        );
        if (duplicate) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'registration_number must be unique within the ranch'
            });
        }

        const breed_code = (body.breed_code ?? '').trim();
        if (!isValidCattleBreedCode(breed_code)) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Invalid or missing breed_code'
            });
        }

        let mother_animal_uuid = body.mother_animal_uuid ?? null;
        let father_animal_uuid = body.father_animal_uuid ?? null;

        if (body.mother_registration_number?.trim()) {
            mother_animal_uuid = await this.resolveParentUuidByRegistration(
                ranchUuid,
                body.mother_registration_number,
                'FEMALE'
            );
        }
        if (body.father_registration_number?.trim()) {
            father_animal_uuid = await this.resolveParentUuidByRegistration(
                ranchUuid,
                body.father_registration_number,
                'MALE'
            );
        }

        if (body.current_owner_uuid) {
            const ok = await this.ownerRepository.existsActive(body.current_owner_uuid);
            if (!ok) {
                throw new ApiError({
                    name: 'ValidationError',
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    description: 'Owner not found or inactive'
                });
            }
        }

        if (body.current_paddock_uuid) {
            const ok = await this.paddockRepository.existsActiveInRanch(body.current_paddock_uuid, ranchUuid);
            if (!ok) {
                throw new ApiError({
                    name: 'ValidationError',
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    description: 'Paddock not found or does not belong to this ranch'
                });
            }
        }

        await this.validateRanchBelongsToCompany(ranchUuid, { uuid_company: tenantCompany });

        const companyResponse = await this.companyService.getById({ id: tenantCompany, includeInactive: true });
        if (!companyResponse.success || !companyResponse.data) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Company not found'
            });
        }

        const plan = normalizeCompanyPlanType(companyResponse.data.plan_type);
        const headLimit = PLAN_HEAD_LIMIT[plan];
        const currentHeads = await this.animalRepository.countActiveByCompany(tenantCompany);
        if (currentHeads >= headLimit) {
            throw new ApiError({
                name: 'PlanAnimalHeadLimitReached',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: `Animal head limit reached for this company (${headLimit} heads for plan ${plan})`
            });
        }

        const birth_date = this.assertNormalizedBirthDate(body.birth_date);

        const payload: AnimalCreationAttributes = {
            ranch_uuid: ranchUuid,
            breed_code,
            registration_number,
            mother_animal_uuid,
            father_animal_uuid,
            current_owner_uuid: body.current_owner_uuid ?? null,
            sex: body.sex ?? 'MALE',
            color: body.color ?? null,
            birth_date,
            origin_type: body.origin_type ?? 'UNKNOWN',
            description: body.description ?? null,
            current_paddock_uuid: body.current_paddock_uuid ?? null,
            current_status: 'ACTIVE',
            is_active: true,
        };

        const animal = await this.animalRepository.create(payload);
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

        const body = animalBody as AnimalWriteRequestBody;

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

        const currentAttrs = current.get({ plain: true }) as AnimalAttributes;

        const ranchUuid = currentAttrs.ranch_uuid;

        const effectiveTenant = {
            uuid_company: tenantContext?.uuid_company,
            uuid_ranch_in: tenantContext?.uuid_ranch_in,
        };

        await this.validateRanchBelongsToCompany(currentAttrs.ranch_uuid, effectiveTenant);
        const nextRanch = body.ranch_uuid ?? currentAttrs.ranch_uuid;
        await this.validateRanchBelongsToCompany(nextRanch, effectiveTenant);

        if (body.breed_code !== undefined && body.breed_code !== null) {
            const bc = String(body.breed_code).trim();
            if (!isValidCattleBreedCode(bc)) {
                throw new ApiError({
                    name: 'ValidationError',
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    description: 'Invalid breed_code'
                });
            }
        }

        if (body.registration_number?.trim()) {
            const reg = body.registration_number.trim();
            const conflict = await this.animalRepository.findAnimalUuidByRanchAndRegistration(
                nextRanch,
                reg,
                { excludeAnimalUuid: id }
            );
            if (conflict) {
                throw new ApiError({
                    name: 'ValidationError',
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    description: 'registration_number must be unique within the ranch'
                });
            }
        }

        let mother_animal_uuid = body.mother_animal_uuid !== undefined ? body.mother_animal_uuid : currentAttrs.mother_animal_uuid;
        let father_animal_uuid = body.father_animal_uuid !== undefined ? body.father_animal_uuid : currentAttrs.father_animal_uuid;

        if (body.mother_registration_number?.trim()) {
            mother_animal_uuid = await this.resolveParentUuidByRegistration(
                nextRanch,
                body.mother_registration_number,
                'FEMALE'
            );
        }
        if (body.father_registration_number?.trim()) {
            father_animal_uuid = await this.resolveParentUuidByRegistration(
                nextRanch,
                body.father_registration_number,
                'MALE'
            );
        }

        if (body.current_owner_uuid) {
            const ok = await this.ownerRepository.existsActive(body.current_owner_uuid);
            if (!ok) {
                throw new ApiError({
                    name: 'ValidationError',
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    description: 'Owner not found or inactive'
                });
            }
        }

        const paddockRanch = nextRanch;
        if (body.current_paddock_uuid) {
            const ok = await this.paddockRepository.existsActiveInRanch(body.current_paddock_uuid, paddockRanch);
            if (!ok) {
                throw new ApiError({
                    name: 'ValidationError',
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    description: 'Paddock not found or does not belong to this ranch'
                });
            }
        }

        const plain = current.get({ plain: true }) as AnimalAttributes;
        const rawBirth = body.birth_date !== undefined && body.birth_date !== null ? body.birth_date : plain.birth_date;
        const birth_date = this.assertNormalizedBirthDate(rawBirth);

        const merged: AnimalCreationAttributes = {
            ranch_uuid: body.ranch_uuid ?? plain.ranch_uuid,
            breed_code: body.breed_code ?? plain.breed_code,
            registration_number: body.registration_number ?? plain.registration_number,
            mother_animal_uuid,
            father_animal_uuid,
            current_owner_uuid: body.current_owner_uuid !== undefined ? body.current_owner_uuid : plain.current_owner_uuid ?? null,
            sex: body.sex ?? plain.sex,
            color: body.color !== undefined ? body.color : plain.color,
            birth_date,
            origin_type: body.origin_type ?? plain.origin_type,
            current_status: body.current_status ?? plain.current_status,
            description: body.description !== undefined ? body.description : plain.description,
            current_paddock_uuid: body.current_paddock_uuid !== undefined
                ? body.current_paddock_uuid
                : plain.current_paddock_uuid ?? null,
            is_active: body.is_active ?? plain.is_active,
        };
        const updated = await this.animalRepository.update(id, merged);
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

    async listParentCandidates(
        ranch_uuid: string,
        sex: AnimalSex,
        tenantContext?: { uuid_company?: string; uuid_ranch_in?: string[] }
    ): Promise<ServiceResponse<{ animal_uuid: string; registration_number: string }[]>> {
        await this.validateRanchBelongsToCompany(ranch_uuid, { uuid_company: tenantContext?.uuid_company });
        if (tenantContext?.uuid_ranch_in?.length && !tenantContext.uuid_ranch_in.includes(ranch_uuid)) {
            throw new ApiError({
                name: 'Forbidden',
                statusCode: HttpStatusCodes.FORBIDDEN,
                description: 'Ranch not allowed for this user'
            });
        }
        const rows = await this.animalRepository.listByRanchForParentSelection(ranch_uuid, sex);
        return { success: true, data: rows };
    }
}

export default AnimalService;
