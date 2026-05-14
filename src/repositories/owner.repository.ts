import { OwnerModel } from "../database/models/animal-operations.models";

class OwnerRepository {
    async findAllActive(limit = 500): Promise<{ owner_uuid: string; full_name: string }[]> {
        const rows = await OwnerModel.findAll({
            where: { is_active: true },
            attributes: ["owner_uuid", "full_name"],
            order: [["full_name", "ASC"]],
            limit,
        });
        return rows.map((r) => {
            const p = r.get({ plain: true }) as { owner_uuid: string; full_name: string };
            return { owner_uuid: p.owner_uuid, full_name: p.full_name };
        });
    }

    async existsActive(owner_uuid: string): Promise<boolean> {
        const n = await OwnerModel.count({ where: { owner_uuid, is_active: true } });
        return n > 0;
    }
}

export default OwnerRepository;
