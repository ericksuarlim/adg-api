"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tenant_request_context_1 = require("../database/tenant/tenant-request-context");
class OwnerRepository {
    async findAllActive(limit = 500) {
        const { OwnerModel } = (0, tenant_request_context_1.requireTenantModels)();
        const rows = await OwnerModel.findAll({
            where: { is_active: true },
            attributes: ["owner_uuid", "full_name"],
            order: [["full_name", "ASC"]],
            limit,
        });
        return rows.map((r) => {
            const p = r.get({ plain: true });
            return { owner_uuid: p.owner_uuid, full_name: p.full_name };
        });
    }
    async existsActive(owner_uuid) {
        const { OwnerModel } = (0, tenant_request_context_1.requireTenantModels)();
        const n = await OwnerModel.count({ where: { owner_uuid, is_active: true } });
        return n > 0;
    }
}
exports.default = OwnerRepository;
