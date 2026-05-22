"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const tenant_request_context_1 = require("../database/tenant/tenant-request-context");
class PaddockRepository {
    async findAll(params) {
        const { PaddockModel, RanchModel } = (0, tenant_request_context_1.requireTenantModels)();
        const { page, size, order } = params;
        const offset = (page - 1) * size;
        const paddockWhere = { is_active: true };
        const searchTerm = params.search?.trim();
        if (searchTerm) {
            const pattern = `%${searchTerm}%`;
            paddockWhere[sequelize_1.Op.or] = [
                { name: { [sequelize_1.Op.iLike]: pattern } },
                { grass_type: { [sequelize_1.Op.iLike]: pattern } },
                { water_source: { [sequelize_1.Op.iLike]: pattern } },
                { description: { [sequelize_1.Op.iLike]: pattern } },
                { "$ranch.name$": { [sequelize_1.Op.iLike]: pattern } },
            ];
        }
        const ranchWhere = { is_active: true };
        if (params.ranch_uuid) {
            paddockWhere.ranch_uuid = params.ranch_uuid;
        }
        else if (params.uuid_ranch_in?.length) {
            paddockWhere.ranch_uuid = { [sequelize_1.Op.in]: params.uuid_ranch_in };
        }
        if (params.uuid_company) {
            ranchWhere.uuid_company = params.uuid_company;
        }
        const sortBy = params.sortBy === "ranch_name" ? "ranch_name" : "name";
        const orderClause = sortBy === "ranch_name"
            ? [[{ model: RanchModel, as: "ranch" }, "name", order], ["name", order]]
            : [["name", order]];
        const { rows, count } = await PaddockModel.findAndCountAll({
            where: paddockWhere,
            include: [{
                    model: RanchModel,
                    as: "ranch",
                    required: true,
                    attributes: ["uuid_ranch", "name", "uuid_company"],
                    where: ranchWhere,
                }],
            order: orderClause,
            offset,
            limit: size,
            distinct: true,
            subQuery: false,
        });
        const mapped = rows.map((row) => {
            const plain = row.get({ plain: true });
            return {
                ...plain,
                ranch_name: plain.ranch?.name,
            };
        });
        return { rows: mapped, count };
    }
    async findActiveByRanch(ranch_uuid) {
        const result = await this.findAll({
            page: 1,
            size: 500,
            sortBy: "name",
            order: "ASC",
            status: "active",
            ranch_uuid,
        });
        return result.rows;
    }
    async findById(params) {
        const { PaddockModel } = (0, tenant_request_context_1.requireTenantModels)();
        const where = { paddock_uuid: params.paddock_uuid };
        if (params.ranch_uuid) {
            where.ranch_uuid = params.ranch_uuid;
        }
        if (!params.includeInactive) {
            where.is_active = true;
        }
        const row = await PaddockModel.findOne({ where });
        return row ? row.get({ plain: true }) : null;
    }
    async existsActiveNameInRanch(ranch_uuid, name, excludePaddockUuid) {
        const { PaddockModel } = (0, tenant_request_context_1.requireTenantModels)();
        const where = {
            ranch_uuid,
            is_active: true,
            name: { [sequelize_1.Op.iLike]: name.trim() },
        };
        if (excludePaddockUuid) {
            where.paddock_uuid = { [sequelize_1.Op.ne]: excludePaddockUuid };
        }
        const n = await PaddockModel.count({ where });
        return n > 0;
    }
    async create(data) {
        const { PaddockModel } = (0, tenant_request_context_1.requireTenantModels)();
        const row = await PaddockModel.create(data);
        return row.get({ plain: true });
    }
    async update(paddock_uuid, data, ranch_uuid) {
        const { PaddockModel } = (0, tenant_request_context_1.requireTenantModels)();
        const where = { paddock_uuid, is_active: true };
        if (ranch_uuid) {
            where.ranch_uuid = ranch_uuid;
        }
        const [count, rows] = await PaddockModel.update(data, {
            where,
            returning: true,
        });
        if (count === 0 || !rows.length) {
            return null;
        }
        return rows[0].get({ plain: true });
    }
    async delete(paddock_uuid, ranch_uuid) {
        const { PaddockModel } = (0, tenant_request_context_1.requireTenantModels)();
        const where = { paddock_uuid, is_active: true };
        if (ranch_uuid) {
            where.ranch_uuid = ranch_uuid;
        }
        const [count] = await PaddockModel.update({ is_active: false }, { where });
        return count > 0;
    }
    async existsActiveInRanch(paddock_uuid, ranch_uuid) {
        const { PaddockModel } = (0, tenant_request_context_1.requireTenantModels)();
        const n = await PaddockModel.count({
            where: { paddock_uuid, ranch_uuid, is_active: true },
        });
        return n > 0;
    }
}
exports.default = PaddockRepository;
