"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const tenant_request_context_1 = require("../database/tenant/tenant-request-context");
const search_where_util_1 = require("../utils/search-where.util");
class OwnerRepository {
    async findAll(params) {
        const { OwnerModel } = (0, tenant_request_context_1.requireTenantModels)();
        const { page, size, order } = params;
        const offset = (page - 1) * size;
        const where = { is_active: true };
        const searchClause = (0, search_where_util_1.buildSearchOrClause)(params.search, [
            "full_name",
            "document_number",
            "phone_number",
            "email",
            "address",
            "description",
        ]);
        if (searchClause) {
            Object.assign(where, searchClause);
        }
        const { rows, count } = await OwnerModel.findAndCountAll({
            where,
            attributes: ["owner_uuid", "full_name", "document_number", "phone_number", "email"],
            order: [["full_name", order]],
            offset,
            limit: size,
        });
        const mapped = rows.map((r) => {
            const p = r.get({ plain: true });
            return {
                owner_uuid: p.owner_uuid,
                full_name: p.full_name,
                document_number: p.document_number,
                phone_number: p.phone_number,
                email: p.email,
            };
        });
        return { rows: mapped, count };
    }
    async findAllActive(limit = 500) {
        const result = await this.findAll({
            page: 1,
            size: limit,
            sortBy: "full_name",
            order: "ASC",
            status: "active",
        });
        return result.rows;
    }
    async findById(params) {
        const { OwnerModel } = (0, tenant_request_context_1.requireTenantModels)();
        const where = { owner_uuid: params.owner_uuid };
        if (!params.includeInactive) {
            where.is_active = true;
        }
        const row = await OwnerModel.findOne({ where });
        return row ? row.get({ plain: true }) : null;
    }
    async existsActiveFullName(full_name, excludeOwnerUuid) {
        const { OwnerModel } = (0, tenant_request_context_1.requireTenantModels)();
        const where = {
            is_active: true,
            full_name: { [sequelize_1.Op.iLike]: full_name.trim() },
        };
        if (excludeOwnerUuid) {
            where.owner_uuid = { [sequelize_1.Op.ne]: excludeOwnerUuid };
        }
        const n = await OwnerModel.count({ where });
        return n > 0;
    }
    async create(data) {
        const { OwnerModel } = (0, tenant_request_context_1.requireTenantModels)();
        const row = await OwnerModel.create(data);
        return row.get({ plain: true });
    }
    async update(owner_uuid, data) {
        const { OwnerModel } = (0, tenant_request_context_1.requireTenantModels)();
        const [count, rows] = await OwnerModel.update(data, {
            where: { owner_uuid, is_active: true },
            returning: true,
        });
        if (count === 0 || !rows.length) {
            return null;
        }
        return rows[0].get({ plain: true });
    }
    async delete(owner_uuid) {
        const { OwnerModel } = (0, tenant_request_context_1.requireTenantModels)();
        const [count] = await OwnerModel.update({ is_active: false }, {
            where: { owner_uuid, is_active: true },
        });
        return count > 0;
    }
    async existsActive(owner_uuid) {
        const { OwnerModel } = (0, tenant_request_context_1.requireTenantModels)();
        const n = await OwnerModel.count({ where: { owner_uuid, is_active: true } });
        return n > 0;
    }
}
exports.default = OwnerRepository;
