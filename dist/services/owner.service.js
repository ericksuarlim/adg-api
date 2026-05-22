"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apiError_1 = __importDefault(require("../errors/apiError"));
const httpStatusCodes_1 = __importDefault(require("../errors/httpStatusCodes"));
class OwnerService {
    constructor(ownerRepository) {
        this.ownerRepository = ownerRepository;
    }
    async listActive() {
        const rows = await this.ownerRepository.findAllActive();
        return { success: true, data: rows };
    }
    async listPaginated(params) {
        const { rows, count } = await this.ownerRepository.findAll(params);
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
    async getById(owner_uuid) {
        const owner = await this.ownerRepository.findById({ owner_uuid });
        if (!owner) {
            throw new apiError_1.default({
                name: "NotFound",
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
                description: "Owner not found",
            });
        }
        return { success: true, data: owner };
    }
    async create(body) {
        const full_name = body.full_name?.trim();
        if (!full_name) {
            throw new apiError_1.default({
                name: "ValidationError",
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: "Owner full name is required",
            });
        }
        this.assertValidEmail(body.email);
        const duplicate = await this.ownerRepository.existsActiveFullName(full_name);
        if (duplicate) {
            throw new apiError_1.default({
                name: "Conflict",
                statusCode: httpStatusCodes_1.default.CONFLICT,
                description: "An owner with this name already exists",
            });
        }
        const created = await this.ownerRepository.create({
            full_name,
            document_number: this.normalizeOptionalString(body.document_number),
            phone_number: this.normalizeOptionalString(body.phone_number),
            email: this.normalizeOptionalString(body.email),
            address: this.normalizeOptionalString(body.address),
            description: this.normalizeOptionalString(body.description),
            is_active: true,
        });
        return { success: true, data: created };
    }
    async update(owner_uuid, body) {
        const existing = await this.ownerRepository.findById({ owner_uuid });
        if (!existing) {
            throw new apiError_1.default({
                name: "NotFound",
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
                description: "Owner not found",
            });
        }
        const full_name = body.full_name !== undefined ? body.full_name?.trim() : undefined;
        if (full_name !== undefined && !full_name) {
            throw new apiError_1.default({
                name: "ValidationError",
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: "Owner full name is required",
            });
        }
        if (body.email !== undefined) {
            this.assertValidEmail(body.email);
        }
        if (full_name) {
            const duplicate = await this.ownerRepository.existsActiveFullName(full_name, owner_uuid);
            if (duplicate) {
                throw new apiError_1.default({
                    name: "Conflict",
                    statusCode: httpStatusCodes_1.default.CONFLICT,
                    description: "An owner with this name already exists",
                });
            }
        }
        const patch = {};
        if (full_name !== undefined) {
            patch.full_name = full_name;
        }
        if (body.document_number !== undefined) {
            patch.document_number = this.normalizeOptionalString(body.document_number);
        }
        if (body.phone_number !== undefined) {
            patch.phone_number = this.normalizeOptionalString(body.phone_number);
        }
        if (body.email !== undefined) {
            patch.email = this.normalizeOptionalString(body.email);
        }
        if (body.address !== undefined) {
            patch.address = this.normalizeOptionalString(body.address);
        }
        if (body.description !== undefined) {
            patch.description = this.normalizeOptionalString(body.description);
        }
        const updated = await this.ownerRepository.update(owner_uuid, patch);
        if (!updated) {
            throw new apiError_1.default({
                name: "NotFound",
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
                description: "Owner not found",
            });
        }
        return { success: true, data: updated };
    }
    async delete(owner_uuid) {
        const existing = await this.ownerRepository.findById({ owner_uuid });
        if (!existing) {
            throw new apiError_1.default({
                name: "NotFound",
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
                description: "Owner not found",
            });
        }
        const deleted = await this.ownerRepository.delete(owner_uuid);
        if (!deleted) {
            throw new apiError_1.default({
                name: "NotFound",
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
                description: "Owner not found",
            });
        }
        return { success: true, data: null };
    }
    normalizeOptionalString(value) {
        if (value === undefined || value === null) {
            return null;
        }
        const trimmed = String(value).trim();
        return trimmed.length ? trimmed : null;
    }
    assertValidEmail(value) {
        const email = this.normalizeOptionalString(value);
        if (!email) {
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new apiError_1.default({
                name: "ValidationError",
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: "Owner email format is invalid",
            });
        }
    }
}
exports.default = OwnerService;
