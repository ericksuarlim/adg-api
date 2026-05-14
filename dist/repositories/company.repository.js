"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../database/models");
class CompanyRepository {
    async findAll(params) {
        const { page, size, sortBy, order, status } = params;
        const offset = (page - 1) * size;
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
        return await models_1.CompanyModel.findAndCountAll({
            where,
            offset,
            limit: size,
            order: [[sortBy, order]],
        });
    }
    async findById(params) {
        const { id, includeInactive, uuid_company } = params;
        const where = { uuid_company: id };
        if (!includeInactive) {
            where.is_active = true;
        }
        if (uuid_company) {
            where.uuid_company = uuid_company;
        }
        return await models_1.CompanyModel.findOne({ where });
    }
    async create(data) {
        return await models_1.CompanyModel.create(data);
    }
    async update(uuid_company, data, options) {
        const where = { uuid_company, is_active: true };
        if (options?.uuid_company) {
            where.uuid_company = options.uuid_company;
        }
        const [count, updated] = await models_1.CompanyModel.update(data, {
            where,
            returning: true,
        });
        if (count === 0)
            return null;
        return updated[0];
    }
    async delete(uuid_company, options) {
        const where = { uuid_company, is_active: true };
        if (options?.uuid_company) {
            where.uuid_company = options.uuid_company;
        }
        const [count] = await models_1.CompanyModel.update({ is_active: false }, { where });
        return count > 0;
    }
    async reactivate(uuid_company, options) {
        const where = { uuid_company, is_active: false };
        if (options?.uuid_company) {
            where.uuid_company = options.uuid_company;
        }
        const [count, updated] = await models_1.CompanyModel.update({ is_active: true }, { where, returning: true });
        if (count === 0) {
            return null;
        }
        return updated?.[0] ?? null;
    }
    async updateMembershipState(uuid_company, data, options) {
        const where = { uuid_company };
        if (options?.uuid_company) {
            where.uuid_company = options.uuid_company;
        }
        const [count, updated] = await models_1.CompanyModel.update(data, {
            where,
            returning: true
        });
        if (count === 0) {
            return null;
        }
        return updated[0];
    }
    async updateTenantProvisioning(uuid_company, fields) {
        const [count, updated] = await models_1.CompanyModel.update(fields, {
            where: { uuid_company },
            returning: true,
        });
        if (count === 0) {
            return null;
        }
        return updated[0];
    }
}
exports.default = CompanyRepository;
