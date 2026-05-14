import { IBaseRepository } from "../interfaces/repositories/base-repository.interface";
import { RanchCreationAttributes } from "../interfaces/ranch/ranch.interface";
import { Op } from "sequelize";
import type { Model } from "sequelize";
import type { RanchAttributes } from "../interfaces/ranch/ranch.interface";
import { requireTenantModels } from "../database/tenant/tenant-request-context";

type RanchRow = Model<RanchAttributes, RanchCreationAttributes>;

class RanchRepository implements IBaseRepository<RanchRow, RanchCreationAttributes> {

    async findAll(params: {
        page: number;
        size: number;
        sortBy: string;
        order: 'ASC' | 'DESC';
        status?: 'all' | 'active' | 'inactive';
        uuid_company?: string;
        uuid_ranch_in?: string[];
    }): Promise<{rows: RanchRow[], count: number}> {

        const { RanchModel } = requireTenantModels();
        const { page, size, sortBy, order, status } = params;

        const offset = (page - 1) * size;
        const limit = size;

        const where: Record<string, unknown> = {};

        if (status === 'active') {
            where.is_active = true;
        } else if (status === 'inactive') {
            where.is_active = false;
        }
        if (params.uuid_company) {
            where.uuid_company = params.uuid_company;
        }
        if (params.uuid_ranch_in?.length) {
            where.uuid_ranch = { [Op.in]: params.uuid_ranch_in };
        }

        return await RanchModel.findAndCountAll({
            where,
            offset,
            limit,
            order: [[sortBy, order]],
        });
    }

    async findById(params: {
        id: string;
        includeInactive?: boolean;
        uuid_company?: string;
        uuid_ranch_in?: string[];
    }): Promise<RanchRow | null> {
        const { RanchModel } = requireTenantModels();
        const { id: uuid_ranch, includeInactive, uuid_company, uuid_ranch_in } = params;

        if (uuid_ranch_in?.length && !uuid_ranch_in.includes(uuid_ranch)) {
            return null;
        }

        const where: Record<string, unknown> = { uuid_ranch };

        if (!includeInactive) {
            where.is_active = true;
        }
        if (uuid_company) {
            where.uuid_company = uuid_company;
        }

        return await RanchModel.findOne({ where });
    }

    async create(data: RanchCreationAttributes): Promise<RanchRow> {
        const { RanchModel } = requireTenantModels();
        return await RanchModel.create(data);
    }

    async update(uuid_ranch: string, data: RanchCreationAttributes, options?: { uuid_company?: string }): Promise<RanchRow | null> {
        const { RanchModel } = requireTenantModels();
        const where: Record<string, unknown> = { uuid_ranch, is_active: true };
        if (options?.uuid_company) {
            where.uuid_company = options.uuid_company;
        }

        const [count, updatedRanch] = await RanchModel.update(data, {
            where,
            returning: true,
        });

        if (count === 0) return null;

        return updatedRanch[0];
    }

    async delete(uuid_ranch: string, options?: { uuid_company?: string }): Promise<boolean> {
        const { RanchModel } = requireTenantModels();
        const where: Record<string, unknown> = { uuid_ranch, is_active: true };
        if (options?.uuid_company) {
            where.uuid_company = options.uuid_company;
        }

        const [count] = await RanchModel.update(
            { is_active: false },
            { where }
        );

        return count > 0;
    }
}

export default RanchRepository;
