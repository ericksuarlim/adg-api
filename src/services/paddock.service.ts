import ApiError from "../errors/apiError";
import HttpStatusCodes from "../errors/httpStatusCodes";
import { ServiceResponse } from "../interfaces/common/service-response.interface";
import { PaddockAttributes, PaddockCreationAttributes } from "../interfaces/paddock/paddock.interface";
import PaddockRepository from "../repositories/paddock.repository";
import RanchRepository from "../repositories/ranch.repository";

export interface PaddockAccessContext {
    uuid_company?: string;
    uuid_ranch_in?: string[];
}

class PaddockService {
    constructor(
        private readonly paddockRepository: PaddockRepository,
        private readonly ranchRepository: RanchRepository
    ) {}

    async listByRanch(
        ranch_uuid: string,
        access: PaddockAccessContext
    ): Promise<ServiceResponse<PaddockAttributes[]>> {
        await this.assertRanchAccess(ranch_uuid, access);
        const rows = await this.paddockRepository.findActiveByRanch(ranch_uuid);
        return { success: true, data: rows };
    }

    async getById(
        paddock_uuid: string,
        access: PaddockAccessContext
    ): Promise<ServiceResponse<PaddockAttributes>> {
        const paddock = await this.paddockRepository.findById({ paddock_uuid });
        if (!paddock) {
            throw new ApiError({
                name: "NotFound",
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: "Paddock not found",
            });
        }
        await this.assertRanchAccess(paddock.ranch_uuid, access);
        return { success: true, data: paddock };
    }

    async create(
        body: PaddockCreationAttributes,
        access: PaddockAccessContext
    ): Promise<ServiceResponse<PaddockAttributes>> {
        const ranch_uuid = body.ranch_uuid?.trim();
        const name = body.name?.trim();
        if (!ranch_uuid) {
            throw new ApiError({
                name: "ValidationError",
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: "ranch_uuid is required",
            });
        }
        if (!name) {
            throw new ApiError({
                name: "ValidationError",
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: "Paddock name is required",
            });
        }

        await this.assertRanchAccess(ranch_uuid, access);

        const duplicate = await this.paddockRepository.existsActiveNameInRanch(ranch_uuid, name);
        if (duplicate) {
            throw new ApiError({
                name: "Conflict",
                statusCode: HttpStatusCodes.CONFLICT,
                description: "A paddock with this name already exists on the ranch",
            });
        }

        const created = await this.paddockRepository.create({
            ranch_uuid,
            name,
            size_in_hectares: this.normalizeDecimal(body.size_in_hectares),
            grass_type: this.normalizeOptionalString(body.grass_type),
            water_source: this.normalizeOptionalString(body.water_source),
            maximum_capacity: this.normalizeInteger(body.maximum_capacity),
            description: this.normalizeOptionalString(body.description),
            is_active: true,
        });

        return { success: true, data: created };
    }

    async update(
        paddock_uuid: string,
        body: Partial<PaddockCreationAttributes>,
        access: PaddockAccessContext
    ): Promise<ServiceResponse<PaddockAttributes>> {
        const existing = await this.paddockRepository.findById({ paddock_uuid });
        if (!existing) {
            throw new ApiError({
                name: "NotFound",
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: "Paddock not found",
            });
        }

        await this.assertRanchAccess(existing.ranch_uuid, access);

        const name = body.name !== undefined ? body.name?.trim() : undefined;
        if (name !== undefined && !name) {
            throw new ApiError({
                name: "ValidationError",
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: "Paddock name is required",
            });
        }

        if (name) {
            const duplicate = await this.paddockRepository.existsActiveNameInRanch(
                existing.ranch_uuid,
                name,
                paddock_uuid
            );
            if (duplicate) {
                throw new ApiError({
                    name: "Conflict",
                    statusCode: HttpStatusCodes.CONFLICT,
                    description: "A paddock with this name already exists on the ranch",
                });
            }
        }

        const patch: Partial<PaddockCreationAttributes> = {};
        if (name !== undefined) {
            patch.name = name;
        }
        if (body.size_in_hectares !== undefined) {
            patch.size_in_hectares = this.normalizeDecimal(body.size_in_hectares);
        }
        if (body.grass_type !== undefined) {
            patch.grass_type = this.normalizeOptionalString(body.grass_type);
        }
        if (body.water_source !== undefined) {
            patch.water_source = this.normalizeOptionalString(body.water_source);
        }
        if (body.maximum_capacity !== undefined) {
            patch.maximum_capacity = this.normalizeInteger(body.maximum_capacity);
        }
        if (body.description !== undefined) {
            patch.description = this.normalizeOptionalString(body.description);
        }

        const updated = await this.paddockRepository.update(paddock_uuid, patch, existing.ranch_uuid);
        if (!updated) {
            throw new ApiError({
                name: "NotFound",
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: "Paddock not found",
            });
        }

        return { success: true, data: updated };
    }

    async delete(paddock_uuid: string, access: PaddockAccessContext): Promise<ServiceResponse<null>> {
        const existing = await this.paddockRepository.findById({ paddock_uuid });
        if (!existing) {
            throw new ApiError({
                name: "NotFound",
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: "Paddock not found",
            });
        }

        await this.assertRanchAccess(existing.ranch_uuid, access);

        const deleted = await this.paddockRepository.delete(paddock_uuid, existing.ranch_uuid);
        if (!deleted) {
            throw new ApiError({
                name: "NotFound",
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: "Paddock not found",
            });
        }

        return { success: true, data: null };
    }

    private async assertRanchAccess(ranch_uuid: string, access: PaddockAccessContext): Promise<void> {
        const ranch = await this.ranchRepository.findById({
            id: ranch_uuid,
            includeInactive: false,
            uuid_company: access.uuid_company,
            uuid_ranch_in: access.uuid_ranch_in,
        });
        if (!ranch) {
            throw new ApiError({
                name: "NotFound",
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: "Ranch not found",
            });
        }
    }

    private normalizeOptionalString(value: string | null | undefined): string | null {
        if (value === undefined || value === null) {
            return null;
        }
        const trimmed = String(value).trim();
        return trimmed.length ? trimmed : null;
    }

    private normalizeDecimal(value: number | string | null | undefined): number | null {
        if (value === undefined || value === null || value === "") {
            return null;
        }
        const n = Number(value);
        if (Number.isNaN(n) || n < 0) {
            throw new ApiError({
                name: "ValidationError",
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: "size_in_hectares must be a non-negative number",
            });
        }
        return n;
    }

    private normalizeInteger(value: number | string | null | undefined): number | null {
        if (value === undefined || value === null || value === "") {
            return null;
        }
        const n = Number(value);
        if (!Number.isInteger(n) || n < 0) {
            throw new ApiError({
                name: "ValidationError",
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: "maximum_capacity must be a non-negative integer",
            });
        }
        return n;
    }
}

export default PaddockService;
