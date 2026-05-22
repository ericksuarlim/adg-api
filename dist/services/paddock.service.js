"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apiError_1 = __importDefault(require("../errors/apiError"));
const httpStatusCodes_1 = __importDefault(require("../errors/httpStatusCodes"));
class PaddockService {
    constructor(paddockRepository, ranchRepository) {
        this.paddockRepository = paddockRepository;
        this.ranchRepository = ranchRepository;
    }
    async listByRanch(ranch_uuid, access) {
        await this.assertRanchAccess(ranch_uuid, access);
        const rows = await this.paddockRepository.findActiveByRanch(ranch_uuid);
        return { success: true, data: rows };
    }
    async listPaginated(params, access) {
        if (params.ranch_uuid) {
            await this.assertRanchAccess(params.ranch_uuid, access);
        }
        else if (params.uuid_ranch_in?.length) {
            for (const ranchUuid of params.uuid_ranch_in) {
                await this.assertRanchAccess(ranchUuid, access);
            }
        }
        else if (params.uuid_company) {
            params.uuid_company = access.uuid_company ?? params.uuid_company;
        }
        else if (access.uuid_ranch_in?.length) {
            params.uuid_ranch_in = access.uuid_ranch_in;
        }
        else if (access.uuid_company) {
            params.uuid_company = access.uuid_company;
        }
        if (!params.ranch_uuid && !params.uuid_ranch_in?.length && !params.uuid_company) {
            throw new apiError_1.default({
                name: "ValidationError",
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: "ranch_uuid, uuid_company, or uuid_ranch_in is required",
            });
        }
        const scopedParams = {
            ...params,
            uuid_company: params.uuid_company ?? access.uuid_company,
        };
        const { rows, count } = await this.paddockRepository.findAll(scopedParams);
        return {
            success: true,
            data: rows,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / params.size),
                currentPage: params.page,
                order: params.order,
                pageSize: params.size,
            },
        };
    }
    async getById(paddock_uuid, access) {
        const paddock = await this.paddockRepository.findById({ paddock_uuid });
        if (!paddock) {
            throw new apiError_1.default({
                name: "NotFound",
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
                description: "Paddock not found",
            });
        }
        await this.assertRanchAccess(paddock.ranch_uuid, access);
        return { success: true, data: paddock };
    }
    async create(body, access) {
        const ranch_uuid = body.ranch_uuid?.trim();
        const name = body.name?.trim();
        if (!ranch_uuid) {
            throw new apiError_1.default({
                name: "ValidationError",
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: "ranch_uuid is required",
            });
        }
        if (!name) {
            throw new apiError_1.default({
                name: "ValidationError",
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: "Paddock name is required",
            });
        }
        await this.assertRanchAccess(ranch_uuid, access);
        const duplicate = await this.paddockRepository.existsActiveNameInRanch(ranch_uuid, name);
        if (duplicate) {
            throw new apiError_1.default({
                name: "Conflict",
                statusCode: httpStatusCodes_1.default.CONFLICT,
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
    async update(paddock_uuid, body, access) {
        const existing = await this.paddockRepository.findById({ paddock_uuid });
        if (!existing) {
            throw new apiError_1.default({
                name: "NotFound",
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
                description: "Paddock not found",
            });
        }
        await this.assertRanchAccess(existing.ranch_uuid, access);
        const name = body.name !== undefined ? body.name?.trim() : undefined;
        if (name !== undefined && !name) {
            throw new apiError_1.default({
                name: "ValidationError",
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: "Paddock name is required",
            });
        }
        if (name) {
            const duplicate = await this.paddockRepository.existsActiveNameInRanch(existing.ranch_uuid, name, paddock_uuid);
            if (duplicate) {
                throw new apiError_1.default({
                    name: "Conflict",
                    statusCode: httpStatusCodes_1.default.CONFLICT,
                    description: "A paddock with this name already exists on the ranch",
                });
            }
        }
        const patch = {};
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
            throw new apiError_1.default({
                name: "NotFound",
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
                description: "Paddock not found",
            });
        }
        return { success: true, data: updated };
    }
    async delete(paddock_uuid, access) {
        const existing = await this.paddockRepository.findById({ paddock_uuid });
        if (!existing) {
            throw new apiError_1.default({
                name: "NotFound",
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
                description: "Paddock not found",
            });
        }
        await this.assertRanchAccess(existing.ranch_uuid, access);
        const deleted = await this.paddockRepository.delete(paddock_uuid, existing.ranch_uuid);
        if (!deleted) {
            throw new apiError_1.default({
                name: "NotFound",
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
                description: "Paddock not found",
            });
        }
        return { success: true, data: null };
    }
    async assertRanchAccess(ranch_uuid, access) {
        const ranch = await this.ranchRepository.findById({
            id: ranch_uuid,
            includeInactive: false,
            uuid_company: access.uuid_company,
            uuid_ranch_in: access.uuid_ranch_in,
        });
        if (!ranch) {
            throw new apiError_1.default({
                name: "NotFound",
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
                description: "Ranch not found",
            });
        }
    }
    normalizeOptionalString(value) {
        if (value === undefined || value === null) {
            return null;
        }
        const trimmed = String(value).trim();
        return trimmed.length ? trimmed : null;
    }
    normalizeDecimal(value) {
        if (value === undefined || value === null || value === "") {
            return null;
        }
        const n = Number(value);
        if (Number.isNaN(n) || n < 0) {
            throw new apiError_1.default({
                name: "ValidationError",
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: "size_in_hectares must be a non-negative number",
            });
        }
        return n;
    }
    normalizeInteger(value) {
        if (value === undefined || value === null || value === "") {
            return null;
        }
        const n = Number(value);
        if (!Number.isInteger(n) || n < 0) {
            throw new apiError_1.default({
                name: "ValidationError",
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: "maximum_capacity must be a non-negative integer",
            });
        }
        return n;
    }
}
exports.default = PaddockService;
