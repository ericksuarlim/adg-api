import {
    CattleWorkSessionCreationAttributes
} from "../interfaces/work-session/cattle-work-session.interface";
import { IBaseRepository } from "../interfaces/repositories/base-repository.interface";
import {Status} from "../interfaces/params/query.interface";
import CattleWorkSessionModel from "../database/models/cattle-work-session.model";

class CattleWorkSessionRepository implements
    IBaseRepository<CattleWorkSessionModel, CattleWorkSessionCreationAttributes> {

    async findAll(
        params: {
            page: number;
            size: number;
            sortBy: string;
            order: 'ASC' | 'DESC';
            status?: Status;
        }
    ): Promise<{ rows: CattleWorkSessionModel[]; count: number }> {

        const { page, size, sortBy, order, status } = params;

        const offset = (page - 1) * size;

        const where: any = {};

        if (status === 'active') {
            where.is_active = true;
        } else if (status === 'inactive') {
            where.is_active = false;
        }

        return await CattleWorkSessionModel.findAndCountAll({
            where,
            offset,
            limit: size,
            order: [[sortBy, order]],
        });
    }

    async findById(
        params: { id: string; includeInactive?: boolean }
    ): Promise<CattleWorkSessionModel | null> {

        const { id, includeInactive } = params;

        const where: any = { uuid_cattle: id };

        if (!includeInactive) {
            where.is_active = true;
        }

        return await CattleWorkSessionModel.findOne({ where });
    }

    async create(
        data: CattleWorkSessionCreationAttributes
    ): Promise<CattleWorkSessionModel> {
        return await CattleWorkSessionModel.create(data);
    }

    async update(
        id_cattle_work: string,
        data: CattleWorkSessionCreationAttributes
    ): Promise<CattleWorkSessionModel | null> {

        const [count, updated] = await CattleWorkSessionModel.update(data, {
            where: { id_cattle_work, is_active: true },
            returning: true,
        });

        if (count === 0) return null;

        return updated[0];
    }

    async delete(id_cattle_work: string): Promise<boolean> {

        const [count] = await CattleWorkSessionModel.update(
            { is_active: false },
            { where: { id_cattle_work, is_active: true } }
        );

        return count > 0;
    }
}

export default CattleWorkSessionRepository;