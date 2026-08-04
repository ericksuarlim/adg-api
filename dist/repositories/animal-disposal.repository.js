"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const tenant_request_context_1 = require("../database/tenant/tenant-request-context");
class AnimalDisposalRepository {
    async create(data) {
        const { AnimalDisposalModel } = (0, tenant_request_context_1.requireTenantModels)();
        return await AnimalDisposalModel.create(data);
    }
    async findLatestByAnimalUuids(animalUuids) {
        const map = new Map();
        if (!animalUuids.length) {
            return map;
        }
        const { AnimalDisposalModel } = (0, tenant_request_context_1.requireTenantModels)();
        const rows = await AnimalDisposalModel.findAll({
            where: {
                animal_uuid: { [sequelize_1.Op.in]: animalUuids },
                is_active: true,
            },
            order: [
                ['animal_uuid', 'ASC'],
                ['disposal_date', 'DESC'],
                ['created_at', 'DESC'],
            ],
        });
        for (const row of rows) {
            const plain = row.get({ plain: true });
            if (!map.has(plain.animal_uuid)) {
                map.set(plain.animal_uuid, plain);
            }
        }
        return map;
    }
    async findLatestByAnimalUuid(animalUuid) {
        const map = await this.findLatestByAnimalUuids([animalUuid]);
        const plain = map.get(animalUuid);
        if (!plain) {
            return null;
        }
        const { AnimalDisposalModel } = (0, tenant_request_context_1.requireTenantModels)();
        return await AnimalDisposalModel.findOne({
            where: { animal_disposal_uuid: plain.animal_disposal_uuid, is_active: true },
        });
    }
}
exports.default = AnimalDisposalRepository;
