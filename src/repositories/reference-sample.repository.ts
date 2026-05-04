import { ReferenceSampleCreationAttributes } from "../interfaces/reference-sample/reference-sample.interface";
import { IBaseRepository } from "../interfaces/repositories/base-repository.interface";
import ReferenceSampleModel from "../database/models/reference-sample.model";
import { IBaseParams } from "../interfaces/params/query.interface";

class ReferenceSampleRepository implements
    IBaseRepository<ReferenceSampleModel, ReferenceSampleCreationAttributes> {

    async findAll(params: IBaseParams): Promise<{ rows: ReferenceSampleModel[], count: number }> {
        const { page, size, sortBy, order, status, uuid_company } = params;
        const offset = (page - 1) * size;

        const where: Record<string, unknown> = {};

        if (status === 'active') {
            where.is_active = true;
        } else if (status === 'inactive') {
            where.is_active = false;
        }

        if (uuid_company) {
            where.uuid_company = uuid_company;
        }

        return ReferenceSampleModel.findAndCountAll({
            where,
            offset,
            limit: size,
            order: [[sortBy, order]],
        });
    }

    async findById(params: {
        id: string;
        includeInactive?: boolean;
        uuid_company?: string;
    }): Promise<ReferenceSampleModel | null> {
        const { id, includeInactive, uuid_company } = params;

        const where: Record<string, unknown> = {
            uuid_reference_sample: id,
        };

        if (!includeInactive) {
            where.is_active = true;
        }

        if (uuid_company) {
            where.uuid_company = uuid_company;
        }

        return ReferenceSampleModel.findOne({ where });
    }

    async create(data: ReferenceSampleCreationAttributes): Promise<ReferenceSampleModel> {
        return ReferenceSampleModel.create(data);
    }

    async update(
        uuid_reference_sample: string,
        data: ReferenceSampleCreationAttributes,
        options?: { uuid_company?: string }
    ): Promise<ReferenceSampleModel | null> {
        const where: Record<string, unknown> = {
            uuid_reference_sample,
            is_active: true,
        };

        if (options?.uuid_company) {
            where.uuid_company = options.uuid_company;
        }

        const [count, updated] = await ReferenceSampleModel.update(data, {
            where,
            returning: true,
        });

        if (count === 0) return null;

        return updated[0];
    }

    async delete(uuid_reference_sample: string, options?: { uuid_company?: string }): Promise<boolean> {
        const where: Record<string, unknown> = {
            uuid_reference_sample,
            is_active: true,
        };

        if (options?.uuid_company) {
            where.uuid_company = options.uuid_company;
        }

        const [count] = await ReferenceSampleModel.update(
            { is_active: false },
            { where }
        );

        return count > 0;
    }
}

export default ReferenceSampleRepository;
