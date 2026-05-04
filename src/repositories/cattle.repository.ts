import { CattleCreationAttributes } from "../interfaces/cattle/cattle.interface";
import { IBaseRepository } from "../interfaces/repositories/base-repository.interface";
import Cattle from "../database/models/cattle.model";
import {Status} from "../interfaces/params/query.interface";

class CattleRepository implements
    IBaseRepository<Cattle, CattleCreationAttributes> {

    async findAll(
        params: {
            page: number;
            size: number;
            sortBy: string;
            order: 'ASC' | 'DESC';
            status?: Status;
        }
    ): Promise<{ rows: Cattle[]; count: number }> {

        const { page, size, sortBy, order, status } = params;

        const offset = (page - 1) * size;

        const where: any = {};

        if (status === 'active') {
            where.is_active = true;
        } else if (status === 'inactive') {
            where.is_active = false;
        }

        return await Cattle.findAndCountAll({
            where,
            offset,
            limit: size,
            order: [[sortBy, order]],
        });
    }

    async findById(
        params: { id: string; includeInactive?: boolean; uuid_company?: string }
    ): Promise<Cattle | null> {

        const { id, includeInactive } = params;

        const where: any = { uuid_cattle: id };

        if (!includeInactive) {
            where.is_active = true;
        }

        return await Cattle.findOne({ where });
    }

    async create(data: CattleCreationAttributes): Promise<Cattle> {
        return await Cattle.create(data);
    }

    async update(
        uuid_cattle: string,
        data: CattleCreationAttributes,
        _options?: { uuid_company?: string }
    ): Promise<Cattle | null> {

        const [count, updated] = await Cattle.update(data, {
            where: { uuid_cattle, is_active: true },
            returning: true,
        });

        if (count === 0) return null;

        return updated[0];
    }

    async delete(uuid_cattle: string, _options?: { uuid_company?: string }): Promise<boolean> {

        const [count] = await Cattle.update(
            { is_active: false },
            { where: { uuid_cattle, is_active: true } }
        );

        return count > 0;
    }
}

export default CattleRepository;