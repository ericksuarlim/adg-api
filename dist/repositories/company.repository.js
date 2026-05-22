"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const models_1 = require("../database/models");
const search_where_util_1 = require("../utils/search-where.util");
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
        const searchClause = (0, search_where_util_1.buildSearchOrClause)(params.search, ["name", "legal_name", "tax_id"]);
        if (searchClause) {
            Object.assign(where, searchClause);
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
    async findConflictingName(name, excludeUuid) {
        const trimmed = name.trim();
        if (!trimmed) {
            return null;
        }
        const where = {
            name: { [sequelize_1.Op.iLike]: trimmed },
        };
        if (excludeUuid) {
            where.uuid_company = { [sequelize_1.Op.ne]: excludeUuid };
        }
        return await models_1.CompanyModel.findOne({ where });
    }
    async findConflictingTaxId(taxId, excludeUuid) {
        const trimmed = taxId.trim();
        if (!trimmed) {
            return null;
        }
        const where = { tax_id: trimmed };
        if (excludeUuid) {
            where.uuid_company = { [sequelize_1.Op.ne]: excludeUuid };
        }
        return await models_1.CompanyModel.findOne({ where });
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
