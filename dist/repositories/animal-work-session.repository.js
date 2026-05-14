"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tenant_request_context_1 = require("../database/tenant/tenant-request-context");
class AnimalWorkSessionRepository {
    async findAll(params) {
        const { AnimalWorkSessionModel } = (0, tenant_request_context_1.requireTenantModels)();
        const { page, size, sortBy, order, status } = params;
        const offset = (page - 1) * size;
        const where = {};
        if (status === 'active') {
            where.is_active = true;
        }
        else if (status === 'inactive') {
            where.is_active = false;
        }
        return await AnimalWorkSessionModel.findAndCountAll({
            where,
            offset,
            limit: size,
            order: [[sortBy, order]],
        });
    }
    async findById(params) {
        const { AnimalWorkSessionModel } = (0, tenant_request_context_1.requireTenantModels)();
        const { id, includeInactive } = params;
        const where = { id_animal_work: id };
        if (!includeInactive) {
            where.is_active = true;
        }
        return await AnimalWorkSessionModel.findOne({ where });
    }
    async create(data) {
        const { AnimalWorkSessionModel } = (0, tenant_request_context_1.requireTenantModels)();
        return await AnimalWorkSessionModel.create(data);
    }
    async update(id_animal_work, data, _options) {
        const { AnimalWorkSessionModel } = (0, tenant_request_context_1.requireTenantModels)();
        const [count, updated] = await AnimalWorkSessionModel.update(data, {
            where: { id_animal_work, is_active: true },
            returning: true,
        });
        if (count === 0)
            return null;
        return updated[0];
    }
    async delete(id_animal_work, _options) {
        const { AnimalWorkSessionModel } = (0, tenant_request_context_1.requireTenantModels)();
        const [count] = await AnimalWorkSessionModel.update({ is_active: false }, { where: { id_animal_work, is_active: true } });
        return count > 0;
    }
}
exports.default = AnimalWorkSessionRepository;
