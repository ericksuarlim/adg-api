"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const tenant_request_context_1 = require("../database/tenant/tenant-request-context");
class RanchRepository {
    async findAll(params) {
        const { RanchModel } = (0, tenant_request_context_1.requireTenantModels)();
        const { page, size, sortBy, order, status } = params;
        const offset = (page - 1) * size;
        const limit = size;
        const where = {};
        if (status === 'active') {
            where.is_active = true;
        }
        else if (status === 'inactive') {
            where.is_active = false;
        }
        if (params.uuid_company) {
            where.uuid_company = params.uuid_company;
        }
        if (params.uuid_ranch_in?.length) {
            where.uuid_ranch = { [sequelize_1.Op.in]: params.uuid_ranch_in };
        }
        return await RanchModel.findAndCountAll({
            where,
            offset,
            limit,
            order: [[sortBy, order]],
        });
    }
    async findById(params) {
        const { RanchModel } = (0, tenant_request_context_1.requireTenantModels)();
        const { id: uuid_ranch, includeInactive, uuid_company, uuid_ranch_in } = params;
        if (uuid_ranch_in?.length && !uuid_ranch_in.includes(uuid_ranch)) {
            return null;
        }
        const where = { uuid_ranch };
        if (!includeInactive) {
            where.is_active = true;
        }
        if (uuid_company) {
            where.uuid_company = uuid_company;
        }
        return await RanchModel.findOne({ where });
    }
    async create(data) {
        const { RanchModel } = (0, tenant_request_context_1.requireTenantModels)();
        return await RanchModel.create(data);
    }
    async update(uuid_ranch, data, options) {
        const { RanchModel } = (0, tenant_request_context_1.requireTenantModels)();
        const where = { uuid_ranch, is_active: true };
        if (options?.uuid_company) {
            where.uuid_company = options.uuid_company;
        }
        const [count, updatedRanch] = await RanchModel.update(data, {
            where,
            returning: true,
        });
        if (count === 0)
            return null;
        return updatedRanch[0];
    }
    async delete(uuid_ranch, options) {
        const { RanchModel } = (0, tenant_request_context_1.requireTenantModels)();
        const where = { uuid_ranch, is_active: true };
        if (options?.uuid_company) {
            where.uuid_company = options.uuid_company;
        }
        const [count] = await RanchModel.update({ is_active: false }, { where });
        return count > 0;
    }
}
exports.default = RanchRepository;
