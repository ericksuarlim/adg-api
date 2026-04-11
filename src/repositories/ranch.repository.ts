import { IBaseRepository } from "../interfaces/repositories/base-repository.interface";
import { RanchModel } from "../database/models";
import { RanchCreationAttributes } from "../interfaces/ranch/ranch.interface";

class RanchRepository implements IBaseRepository<RanchModel, RanchCreationAttributes> {

    async findAll(params: {
        page: number;
        size: number;
        sortBy: string;
        order: 'ASC' | 'DESC';
        status?: 'all' | 'active' | 'inactive';
    }): Promise<{rows: RanchModel[], count: number}> {

        const { page, size, sortBy, order, status } = params;

        const offset = (page - 1) * size;
        const limit = size;

        const where: any = {};

        if (status === 'active') {
            where.is_active = true;
        } else if (status === 'inactive') {
            where.is_active = false;
        }

        return await RanchModel.findAndCountAll({
            where,
            offset,
            limit,
            order: [[sortBy, order]],
        });
    }

    async findById(params: { id: string; includeInactive?: boolean }): Promise<RanchModel | null> {
        const { id: uuid_ranch, includeInactive } = params;

        const where: any = { uuid_ranch };

        if (!includeInactive) {
            where.is_active = true;
        }

        return await RanchModel.findOne({ where });
    }

    async create(data: RanchCreationAttributes): Promise<RanchModel> {
        return await RanchModel.create(data);
    }

    async update(uuid_ranch: string, data: RanchCreationAttributes): Promise<RanchModel | null> {
        const [count, updatedRanch] = await RanchModel.update(data, {
            where: { uuid_ranch, is_active: true },
            returning: true,
        });

        if (count === 0) return null;

        return updatedRanch[0];
    }

    async delete(uuid_ranch: string): Promise<boolean> {
        const [count] = await RanchModel.update(
            { is_active: false },
            { where: { uuid_ranch, is_active: true } }
        );

        return count > 0;
    }
}

export default RanchRepository;
