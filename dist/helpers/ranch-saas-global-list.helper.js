"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listRanchesForSaasOwner = listRanchesForSaasOwner;
const models_1 = require("../database/models");
const tenant_sequelize_lru_1 = require("../database/tenant/tenant-sequelize-lru");
const query_builder_1 = require("../utils/query.builder");
function ranchSortColumn(sortBy) {
    if (sortBy === 'createdAt') {
        return 'created_at';
    }
    if (sortBy === 'updatedAt') {
        return 'updated_at';
    }
    return sortBy;
}
function timestampValue(value) {
    if (value instanceof Date) {
        return value.getTime();
    }
    if (typeof value === 'string' || typeof value === 'number') {
        const t = new Date(value).getTime();
        return Number.isNaN(t) ? 0 : t;
    }
    return 0;
}
/**
 * Aggregates ranch rows from every company tenant DB (SaaS owner global list).
 * Companies without `tenant_database` are skipped.
 */
async function listRanchesForSaasOwner(query) {
    const params = (0, query_builder_1.buildGetAllParams)(query);
    const companies = await models_1.CompanyModel.findAll({
        where: { is_active: true },
        attributes: ['uuid_company', 'tenant_database'],
    });
    const merged = [];
    const orderCol = ranchSortColumn(params.sortBy);
    for (const company of companies) {
        const dbName = company.tenant_database?.trim();
        if (!dbName) {
            continue;
        }
        try {
            const { models } = await (0, tenant_sequelize_lru_1.getTenantPoolEntry)(dbName);
            const where = {};
            if (params.status === 'active') {
                where.is_active = true;
            }
            else if (params.status === 'inactive') {
                where.is_active = false;
            }
            const rows = await models.RanchModel.findAll({
                where,
                order: [[orderCol, params.order]],
            });
            for (const row of rows) {
                merged.push(row.get({ plain: true }));
            }
        }
        catch {
            /* tenant DB unreachable; skip */
        }
    }
    merged.sort((a, b) => {
        const av = timestampValue(a[orderCol]);
        const bv = timestampValue(b[orderCol]);
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return params.order === 'ASC' ? cmp : -cmp;
    });
    const totalItems = merged.length;
    const offset = (params.page - 1) * params.size;
    const data = merged.slice(offset, offset + params.size);
    return {
        success: true,
        data,
        pagination: {
            totalItems,
            totalPages: totalItems === 0 ? 0 : Math.ceil(totalItems / params.size),
            currentPage: params.page,
            order: params.order,
            pageSize: params.size,
        },
    };
}
