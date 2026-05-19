import { Op } from "sequelize";
import { PaddockAttributes, PaddockCreationAttributes } from "../interfaces/paddock/paddock.interface";
import { requireTenantModels } from "../database/tenant/tenant-request-context";

class PaddockRepository {
    async findActiveByRanch(ranch_uuid: string): Promise<PaddockAttributes[]> {
        const { PaddockModel } = requireTenantModels();
        const rows = await PaddockModel.findAll({
            where: { ranch_uuid, is_active: true },
            order: [["name", "ASC"]],
        });
        return rows.map((r) => r.get({ plain: true }) as PaddockAttributes);
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
