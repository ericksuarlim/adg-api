import ApiError from "../errors/apiError";
import HttpStatusCodes from "../errors/httpStatusCodes";
import { ServiceResponse } from "../interfaces/common/service-response.interface";
import { OwnerAttributes, OwnerCreationAttributes } from "../interfaces/owner/owner.interface";
import { IBaseParams } from "../interfaces/params/query.interface";
import OwnerRepository, { OwnerListRow } from "../repositories/owner.repository";

class OwnerService {
    constructor(private readonly ownerRepository: OwnerRepository) {}

    async listActive(): Promise<ServiceResponse<OwnerListRow[]>> {
        const rows = await this.ownerRepository.findAllActive();
        return { success: true, data: rows };
    }

    async listPaginated(params: IBaseParams): Promise<ServiceResponse<OwnerListRow[]>> {
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

    async getById(owner_uuid: string): Promise<ServiceResponse<OwnerAttributes>> {
        const owner = await this.ownerRepository.findById({ owner_uuid });
        if (!owner) {
            throw new ApiError({
                name: "NotFound",
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: "Owner not found",
            });
        }
        return { success: true, data: owner };
    }

    async create(body: OwnerCreationAttributes): Promise<ServiceResponse<OwnerAttributes>> {
        const full_name = body.full_name?.trim();
        if (!full_name) {
            throw new ApiError({
                name: "ValidationError",
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: "Owner full name is required",
            });
        }

        this.assertValidEmail(body.email);

        const duplicate = await this.ownerRepository.existsActiveFullName(full_name);
        if (duplicate) {
            throw new ApiError({
                name: "Conflict",
                statusCode: HttpStatusCodes.CONFLICT,
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

    async update(
        owner_uuid: string,
        body: Partial<OwnerCreationAttributes>
    ): Promise<ServiceResponse<OwnerAttributes>> {
        const existing = await this.ownerRepository.findById({ owner_uuid });
        if (!existing) {
            throw new ApiError({
                name: "NotFound",
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: "Owner not found",
            });
        }

        const full_name = body.full_name !== undefined ? body.full_name?.trim() : undefined;
        if (full_name !== undefined && !full_name) {
            throw new ApiError({
                name: "ValidationError",
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: "Owner full name is required",
            });
        }

        if (body.email !== undefined) {
            this.assertValidEmail(body.email);
        }

        if (full_name) {
            const duplicate = await this.ownerRepository.existsActiveFullName(full_name, owner_uuid);
            if (duplicate) {
                throw new ApiError({
                    name: "Conflict",
                    statusCode: HttpStatusCodes.CONFLICT,
                    description: "An owner with this name already exists",
                });
            }
        }

        const patch: Partial<OwnerCreationAttributes> = {};
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
            throw new ApiError({
                name: "NotFound",
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: "Owner not found",
            });
        }

        return { success: true, data: updated };
    }

    async delete(owner_uuid: string): Promise<ServiceResponse<null>> {
        const existing = await this.ownerRepository.findById({ owner_uuid });
        if (!existing) {
            throw new ApiError({
                name: "NotFound",
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: "Owner not found",
            });
        }

        const deleted = await this.ownerRepository.delete(owner_uuid);
        if (!deleted) {
            throw new ApiError({
                name: "NotFound",
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: "Owner not found",
            });
        }

        return { success: true, data: null };
    }

    private normalizeOptionalString(value: string | null | undefined): string | null {
        if (value === undefined || value === null) {
            return null;
        }
        const trimmed = String(value).trim();
        return trimmed.length ? trimmed : null;
    }

    private assertValidEmail(value: string | null | undefined): void {
        const email = this.normalizeOptionalString(value);
        if (!email) {
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new ApiError({
                name: "ValidationError",
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: "Owner email format is invalid",
            });
        }
    }
}

export default OwnerService;
