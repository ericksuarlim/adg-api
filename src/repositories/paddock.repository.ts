import { requireTenantModels } from "../database/tenant/tenant-request-context";

class PaddockRepository {
    async findActiveByRanch(ranch_uuid: string): Promise<{ paddock_uuid: string; name: string }[]> {
        const { PaddockModel } = requireTenantModels();
        const rows = await PaddockModel.findAll({
            where: { ranch_uuid, is_active: true },
            attributes: ["paddock_uuid", "name"],
            order: [["name", "ASC"]],
        });
        return rows.map((r) => {
            const p = r.get({ plain: true }) as { paddock_uuid: string; name: string };
            return { paddock_uuid: p.paddock_uuid, name: p.name };
        });
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
