import { AnimalCreationAttributes } from "../interfaces/animal/animal.interface";
import { IBaseRepository } from "../interfaces/repositories/base-repository.interface";
import AnimalModel from "../database/models/animal.model";
import { Status } from "../interfaces/params/query.interface";
import RanchModel from "../database/models/ranch.model";

class AnimalRepository implements
    IBaseRepository<AnimalModel, AnimalCreationAttributes> {

    async findAll(
        params: {
            page: number;
            size: number;
            sortBy: string;
            order: 'ASC' | 'DESC';
            status?: Status;
            uuid_company?: string;
        }
    ): Promise<{ rows: AnimalModel[]; count: number }> {
        const { page, size, sortBy, order, status } = params;
        const offset = (page - 1) * size;

        const where: any = {};
        if (status === 'active') {
            where.is_active = true;
        } else if (status === 'inactive') {
            where.is_active = false;
        }

        const include = params.uuid_company ? [{
            model: RanchModel,
            as: 'ranch',
            required: true,
            where: { uuid_company: params.uuid_company, is_active: true }
        }] : [];

        return await AnimalModel.findAndCountAll({
            where,
            include,
            offset,
            limit: size,
            order: [[sortBy, order]],
        });
    }

    async findById(
        params: { id: string; includeInactive?: boolean; uuid_company?: string }
    ): Promise<AnimalModel | null> {
        const { id, includeInactive, uuid_company } = params;
        const where: any = { animal_uuid: id };
        if (!includeInactive) {
            where.is_active = true;
        }

        const include = uuid_company ? [{
            model: RanchModel,
            as: 'ranch',
            required: true,
            where: { uuid_company, is_active: true }
        }] : [];

        return await AnimalModel.findOne({ where, include });
    }

    async create(data: AnimalCreationAttributes): Promise<AnimalModel> {
        return await AnimalModel.create(data);
    }

    async update(
        animal_uuid: string,
        data: AnimalCreationAttributes
    ): Promise<AnimalModel | null> {
        const [count, updated] = await AnimalModel.update(data, {
            where: { animal_uuid, is_active: true },
            returning: true,
        });

        if (count === 0) return null;
        return updated[0];
    }

    async delete(animal_uuid: string, options?: { uuid_company?: string }): Promise<boolean> {
        let canDelete = true;
        if (options?.uuid_company) {
            const current = await AnimalModel.findOne({ where: { animal_uuid, is_active: true } });
            if (current) {
                const ranch = await RanchModel.findOne({
                    where: { uuid_ranch: current.ranch_uuid, uuid_company: options.uuid_company, is_active: true }
                });
                canDelete = Boolean(ranch);
            } else {
                canDelete = false;
            }
        }
        if (!canDelete) {
            return false;
        }

        const [count] = await AnimalModel.update({ is_active: false }, { where: { animal_uuid, is_active: true } });
        return count > 0;
    }
}

export default AnimalRepository;
