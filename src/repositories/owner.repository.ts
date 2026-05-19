import { requireTenantModels } from "../database/tenant/tenant-request-context";

class OwnerRepository {
    async findAllActive(limit = 500): Promise<
        {
            owner_uuid: string;
            full_name: string;
            document_number: string | null;
            phone_number: string | null;
            email: string | null;
        }[]
    > {
        const { OwnerModel } = requireTenantModels();
        const rows = await OwnerModel.findAll({
            where: { is_active: true },
            attributes: ["owner_uuid", "full_name", "document_number", "phone_number", "email"],
            order: [["full_name", "ASC"]],
            limit,
        });
        return rows.map((r) => {
            const p = r.get({ plain: true }) as {
                owner_uuid: string;
                full_name: string;
                document_number: string | null;
                phone_number: string | null;
                email: string | null;
            };
            return {
                owner_uuid: p.owner_uuid,
                full_name: p.full_name,
                document_number: p.document_number,
                phone_number: p.phone_number,
                email: p.email,
            };
        });
    }

    async existsActive(owner_uuid: string): Promise<boolean> {
        const { OwnerModel } = requireTenantModels();
        const n = await OwnerModel.count({ where: { owner_uuid, is_active: true } });
        return n > 0;
    }
}

export default OwnerRepository;
