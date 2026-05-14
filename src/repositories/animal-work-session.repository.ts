import {
    AnimalWorkSessionCreationAttributes,
    AnimalWorkSessionAttributes,
} from "../interfaces/work-session/animal-work-session.interface";
import { IBaseRepository } from "../interfaces/repositories/base-repository.interface";
import { Status } from "../interfaces/params/query.interface";
import type { Model } from "sequelize";
import { requireTenantModels } from "../database/tenant/tenant-request-context";

type AnimalWorkSessionRow = Model<AnimalWorkSessionAttributes, AnimalWorkSessionCreationAttributes>;

class AnimalWorkSessionRepository implements
    IBaseRepository<AnimalWorkSessionRow, AnimalWorkSessionCreationAttributes> {

    async findAll(
        params: {
            page: number;
            size: number;
            sortBy: string;
            order: 'ASC' | 'DESC';
            status?: Status;
        }
    ): Promise<{ rows: AnimalWorkSessionRow[]; count: number }> {
        const { AnimalWorkSessionModel } = requireTenantModels();
        const { page, size, sortBy, order, status } = params;
        const offset = (page - 1) * size;
        const where: Record<string, unknown> = {};

        if (status === 'active') {
            where.is_active = true;
        } else if (status === 'inactive') {
            where.is_active = false;
        }

        return await AnimalWorkSessionModel.findAndCountAll({
            where,
            offset,
            limit: size,
            order: [[sortBy, order]],
        });
    }

    async findById(
        params: { id: string; includeInactive?: boolean; uuid_company?: string }
    ): Promise<AnimalWorkSessionRow | null> {
        const { AnimalWorkSessionModel } = requireTenantModels();
        const { id, includeInactive } = params;
        const where: Record<string, unknown> = { id_animal_work: id };
        if (!includeInactive) {
            where.is_active = true;
        }

        return await AnimalWorkSessionModel.findOne({ where });
    }

    async create(data: AnimalWorkSessionCreationAttributes): Promise<AnimalWorkSessionRow> {
        const { AnimalWorkSessionModel } = requireTenantModels();
        return await AnimalWorkSessionModel.create(data);
    }

    async update(
        id_animal_work: string,
        data: AnimalWorkSessionCreationAttributes,
        _options?: { uuid_company?: string }
    ): Promise<AnimalWorkSessionRow | null> {
        const { AnimalWorkSessionModel } = requireTenantModels();
        const [count, updated] = await AnimalWorkSessionModel.update(data, {
            where: { id_animal_work, is_active: true },
            returning: true,
        });

        if (count === 0) return null;
        return updated[0];
    }

    async delete(id_animal_work: string, _options?: { uuid_company?: string }): Promise<boolean> {
        const { AnimalWorkSessionModel } = requireTenantModels();
        const [count] = await AnimalWorkSessionModel.update(
            { is_active: false },
            { where: { id_animal_work, is_active: true } }
        );
        return count > 0;
    }
}

export default AnimalWorkSessionRepository;
