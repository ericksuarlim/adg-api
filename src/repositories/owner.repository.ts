import { Op } from "sequelize";
import { requireTenantModels } from "../database/tenant/tenant-request-context";
import { OwnerAttributes, OwnerCreationAttributes } from "../interfaces/owner/owner.interface";
import { IBaseParams } from "../interfaces/params/query.interface";
import { buildSearchOrClause } from "../utils/search-where.util";

export type OwnerListRow = {
    owner_uuid: string;
    full_name: string;
    document_number: string | null;
    phone_number: string | null;
    email: string | null;
};

class OwnerRepository {
    async findAll(params: IBaseParams): Promise<{ rows: OwnerListRow[]; count: number }> {
        const { OwnerModel } = requireTenantModels();
        const { page, size, order } = params;
        const offset = (page - 1) * size;

        const where: Record<string, unknown> = { is_active: true };
        const searchClause = buildSearchOrClause(params.search, [
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
            const p = r.get({ plain: true }) as OwnerListRow;
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

    async findAllActive(limit = 500): Promise<OwnerListRow[]> {
        const result = await this.findAll({
            page: 1,
            size: limit,
            sortBy: "full_name",
            order: "ASC",
            status: "active",
        });
        return result.rows;
    }

    async findById(params: {
        owner_uuid: string;
        includeInactive?: boolean;
    }): Promise<OwnerAttributes | null> {
        const { OwnerModel } = requireTenantModels();
        const where: Record<string, unknown> = { owner_uuid: params.owner_uuid };
        if (!params.includeInactive) {
            where.is_active = true;
        }
        const row = await OwnerModel.findOne({ where });
        return row ? (row.get({ plain: true }) as OwnerAttributes) : null;
    }

    async existsActiveFullName(full_name: string, excludeOwnerUuid?: string): Promise<boolean> {
        const { OwnerModel } = requireTenantModels();
        const where: Record<string, unknown> = {
            is_active: true,
            full_name: { [Op.iLike]: full_name.trim() },
        };
        if (excludeOwnerUuid) {
            where.owner_uuid = { [Op.ne]: excludeOwnerUuid };
        }
        const n = await OwnerModel.count({ where });
        return n > 0;
    }

    async create(data: OwnerCreationAttributes): Promise<OwnerAttributes> {
        const { OwnerModel } = requireTenantModels();
        const row = await OwnerModel.create(data);
        return row.get({ plain: true }) as OwnerAttributes;
    }

    async update(
        owner_uuid: string,
        data: Partial<OwnerCreationAttributes>
    ): Promise<OwnerAttributes | null> {
        const { OwnerModel } = requireTenantModels();
        const [count, rows] = await OwnerModel.update(data, {
            where: { owner_uuid, is_active: true },
            returning: true,
        });
        if (count === 0 || !rows.length) {
            return null;
        }
        return rows[0].get({ plain: true }) as OwnerAttributes;
    }

    async delete(owner_uuid: string): Promise<boolean> {
        const { OwnerModel } = requireTenantModels();
        const [count] = await OwnerModel.update({ is_active: false }, {
            where: { owner_uuid, is_active: true },
        });
        return count > 0;
    }

    async existsActive(owner_uuid: string): Promise<boolean> {
        const { OwnerModel } = requireTenantModels();
        const n = await OwnerModel.count({ where: { owner_uuid, is_active: true } });
        return n > 0;
    }
}

export default OwnerRepository;
