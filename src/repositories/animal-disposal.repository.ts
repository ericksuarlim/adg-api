import type { Model } from 'sequelize';
import { Op } from 'sequelize';
import { requireTenantModels } from '../database/tenant/tenant-request-context';
import {
    AnimalDisposalAttributes,
    AnimalDisposalCreationAttributes,
} from '../interfaces/animal/animal-operations.interface';

type AnimalDisposalRow = Model<AnimalDisposalAttributes, AnimalDisposalCreationAttributes>;

class AnimalDisposalRepository {
    async create(data: AnimalDisposalCreationAttributes): Promise<AnimalDisposalRow> {
        const { AnimalDisposalModel } = requireTenantModels();
        return await AnimalDisposalModel.create(data);
    }

    async findLatestByAnimalUuids(animalUuids: string[]): Promise<Map<string, AnimalDisposalAttributes>> {
        const map = new Map<string, AnimalDisposalAttributes>();
        if (!animalUuids.length) {
            return map;
        }

        const { AnimalDisposalModel } = requireTenantModels();
        const rows = await AnimalDisposalModel.findAll({
            where: {
                animal_uuid: { [Op.in]: animalUuids },
                is_active: true,
            },
            order: [
                ['animal_uuid', 'ASC'],
                ['disposal_date', 'DESC'],
                ['created_at', 'DESC'],
            ],
        });

        for (const row of rows) {
            const plain = row.get({ plain: true }) as AnimalDisposalAttributes;
            if (!map.has(plain.animal_uuid)) {
                map.set(plain.animal_uuid, plain);
            }
        }

        return map;
    }

    async findLatestByAnimalUuid(animalUuid: string): Promise<AnimalDisposalRow | null> {
        const map = await this.findLatestByAnimalUuids([animalUuid]);
        const plain = map.get(animalUuid);
        if (!plain) {
            return null;
        }
        const { AnimalDisposalModel } = requireTenantModels();
        return await AnimalDisposalModel.findOne({
            where: { animal_disposal_uuid: plain.animal_disposal_uuid, is_active: true },
        });
    }
}

export default AnimalDisposalRepository;
