import { CompanyModel } from '../database/models';
import { getTenantPoolEntry } from '../database/tenant/tenant-sequelize-lru';
import { buildGetAllParams } from '../utils/query.builder';
import type { RanchAttributes } from '../interfaces/ranch/ranch.interface';

function ranchSortColumn(sortBy: string): string {
    if (sortBy === 'createdAt') {
        return 'created_at';
    }
    if (sortBy === 'updatedAt') {
        return 'updated_at';
    }
    return sortBy;
}

function timestampValue(value: unknown): number {
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
export async function listRanchesForSaasOwner(query: Record<string, unknown>): Promise<{
    success: boolean;
    data: RanchAttributes[];
    pagination: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        order: string;
        pageSize: number;
    };
}> {
    const params = buildGetAllParams(query);
    const companies = await CompanyModel.findAll({
        where: { is_active: true },
        attributes: ['uuid_company', 'tenant_database'],
    });

    const merged: RanchAttributes[] = [];
    const orderCol = ranchSortColumn(params.sortBy);

    for (const company of companies) {
        const dbName = company.tenant_database?.trim();
        if (!dbName) {
            continue;
        }
        try {
            const { models } = await getTenantPoolEntry(dbName);
            const where: Record<string, unknown> = {};
            if (params.status === 'active') {
                where.is_active = true;
            } else if (params.status === 'inactive') {
                where.is_active = false;
            }
            const rows = await models.RanchModel.findAll({
                where,
                order: [[orderCol, params.order]],
            });
            for (const row of rows) {
                merged.push(row.get({ plain: true }) as RanchAttributes);
            }
        } catch {
            /* tenant DB unreachable; skip */
        }
    }

    merged.sort((a, b) => {
        const av = timestampValue((a as unknown as Record<string, unknown>)[orderCol]);
        const bv = timestampValue((b as unknown as Record<string, unknown>)[orderCol]);
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
