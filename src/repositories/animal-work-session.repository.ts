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
            uuid_corral_work_session?: string;
        }
    ): Promise<{ rows: AnimalWorkSessionRow[]; count: number }> {
        const { AnimalWorkSessionModel } = requireTenantModels();
        const { page, size, sortBy, order, status, uuid_corral_work_session } = params;
        const offset = (page - 1) * size;
        const where: Record<string, unknown> = {};

        if (status === 'active') {
            where.is_active = true;
        } else if (status === 'inactive') {
            where.is_active = false;
        }

        if (uuid_corral_work_session) {
            where.uuid_corral_work_session = uuid_corral_work_session;
        }

        return await AnimalWorkSessionModel.findAndCountAll({
            where,
            offset,
            limit: size,
            order: [[sortBy, order]],
        });
    }

    async findByCorralSession(uuid_corral_work_session: string): Promise<AnimalWorkSessionRow[]> {
        const { AnimalWorkSessionModel, AnimalModel } = requireTenantModels();
        return AnimalWorkSessionModel.findAll({
            where: { uuid_corral_work_session, is_active: true },
            include: [{
                model: AnimalModel,
                as: 'animal',
                required: false,
                attributes: ['registration_number', 'chip_number'],
            }],
            order: [['created_at', 'ASC']],
        });
    }

    async findBySessionAndAnimal(
        uuid_corral_work_session: string,
        uuid_animal: string
    ): Promise<AnimalWorkSessionRow | null> {
        const { AnimalWorkSessionModel } = requireTenantModels();
        return AnimalWorkSessionModel.findOne({
            where: { uuid_corral_work_session, uuid_animal, is_active: true },
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
        data: Partial<AnimalWorkSessionCreationAttributes>,
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

    async updateBySessionAndAnimal(
        uuid_corral_work_session: string,
        uuid_animal: string,
        data: Partial<AnimalWorkSessionCreationAttributes>
    ): Promise<AnimalWorkSessionRow | null> {
        const { AnimalWorkSessionModel } = requireTenantModels();
        const [count, updated] = await AnimalWorkSessionModel.update(data, {
            where: { uuid_corral_work_session, uuid_animal, is_active: true },
            returning: true,
        });
        if (count === 0) {
            return null;
        }
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
