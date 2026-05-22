import { Op } from "sequelize";
import { PaddockAttributes, PaddockCreationAttributes } from "../interfaces/paddock/paddock.interface";
import { requireTenantModels } from "../database/tenant/tenant-request-context";
import { IBaseParams } from "../interfaces/params/query.interface";
export type PaddockListRow = PaddockAttributes & {
    ranch_name?: string;
};

export interface PaddockListParams extends IBaseParams {
    ranch_uuid?: string;
}

class PaddockRepository {
    async findAll(params: PaddockListParams): Promise<{ rows: PaddockListRow[]; count: number }> {
        const { PaddockModel, RanchModel } = requireTenantModels();
        const { page, size, order } = params;
        const offset = (page - 1) * size;

        const paddockWhere: Record<string | symbol, unknown> = { is_active: true };
        const searchTerm = params.search?.trim();
        if (searchTerm) {
            const pattern = `%${searchTerm}%`;
            paddockWhere[Op.or as unknown as string] = [
                { name: { [Op.iLike]: pattern } },
                { grass_type: { [Op.iLike]: pattern } },
                { water_source: { [Op.iLike]: pattern } },
                { description: { [Op.iLike]: pattern } },
                { "$ranch.name$": { [Op.iLike]: pattern } },
            ];
        }

        const ranchWhere: Record<string, unknown> = { is_active: true };
        if (params.ranch_uuid) {
            paddockWhere.ranch_uuid = params.ranch_uuid;
        } else if (params.uuid_ranch_in?.length) {
            paddockWhere.ranch_uuid = { [Op.in]: params.uuid_ranch_in };
        }
        if (params.uuid_company) {
            ranchWhere.uuid_company = params.uuid_company;
        }

        const sortBy = params.sortBy === "ranch_name" ? "ranch_name" : "name";
        const orderClause =
            sortBy === "ranch_name"
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
            order: orderClause as never,
            offset,
            limit: size,
            distinct: true,
            subQuery: false,
        });

        const mapped = rows.map((row) => {
            const plain = row.get({ plain: true }) as PaddockAttributes & {
                ranch?: { name: string };
            };
            return {
                ...plain,
                ranch_name: plain.ranch?.name,
            };
        });

        return { rows: mapped, count };
    }

    async findActiveByRanch(ranch_uuid: string): Promise<PaddockAttributes[]> {
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

    async findById(params: {
        paddock_uuid: string;
        ranch_uuid?: string;
        includeInactive?: boolean;
    }): Promise<PaddockAttributes | null> {
        const { PaddockModel } = requireTenantModels();
        const where: Record<string, unknown> = { paddock_uuid: params.paddock_uuid };
        if (params.ranch_uuid) {
            where.ranch_uuid = params.ranch_uuid;
        }
        if (!params.includeInactive) {
            where.is_active = true;
        }
        const row = await PaddockModel.findOne({ where });
        return row ? (row.get({ plain: true }) as PaddockAttributes) : null;
    }

    async existsActiveNameInRanch(
        ranch_uuid: string,
        name: string,
        excludePaddockUuid?: string
    ): Promise<boolean> {
        const { PaddockModel } = requireTenantModels();
        const where: Record<string, unknown> = {
            ranch_uuid,
            is_active: true,
            name: { [Op.iLike]: name.trim() },
        };
        if (excludePaddockUuid) {
            where.paddock_uuid = { [Op.ne]: excludePaddockUuid };
        }
        const n = await PaddockModel.count({ where });
        return n > 0;
    }

    async create(data: PaddockCreationAttributes): Promise<PaddockAttributes> {
        const { PaddockModel } = requireTenantModels();
        const row = await PaddockModel.create(data);
        return row.get({ plain: true }) as PaddockAttributes;
    }

    async update(
        paddock_uuid: string,
        data: Partial<PaddockCreationAttributes>,
        ranch_uuid?: string
    ): Promise<PaddockAttributes | null> {
        const { PaddockModel } = requireTenantModels();
        const where: Record<string, unknown> = { paddock_uuid, is_active: true };
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
        return rows[0].get({ plain: true }) as PaddockAttributes;
    }

    async delete(paddock_uuid: string, ranch_uuid?: string): Promise<boolean> {
        const { PaddockModel } = requireTenantModels();
        const where: Record<string, unknown> = { paddock_uuid, is_active: true };
        if (ranch_uuid) {
            where.ranch_uuid = ranch_uuid;
        }
        const [count] = await PaddockModel.update({ is_active: false }, { where });
        return count > 0;
    }

    async existsActiveInRanch(paddock_uuid: string, ranch_uuid: string): Promise<boolean> {
        const { PaddockModel } = requireTenantModels();
        const n = await PaddockModel.count({
            where: { paddock_uuid, ranch_uuid, is_active: true },
        });
        return n > 0;
    }
}

export default PaddockRepository;
