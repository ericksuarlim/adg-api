"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tenant_request_context_1 = require("../database/tenant/tenant-request-context");
class PaddockRepository {
    async findActiveByRanch(ranch_uuid) {
        const { PaddockModel } = (0, tenant_request_context_1.requireTenantModels)();
        const rows = await PaddockModel.findAll({
            where: { ranch_uuid, is_active: true },
            attributes: ["paddock_uuid", "name"],
            order: [["name", "ASC"]],
        });
        return rows.map((r) => {
            const p = r.get({ plain: true });
            return { paddock_uuid: p.paddock_uuid, name: p.name };
        });
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
