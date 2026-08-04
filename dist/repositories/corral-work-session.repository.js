"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tenant_request_context_1 = require("../database/tenant/tenant-request-context");
class CorralWorkSessionRepository {
    async findAll(params) {
        const { CorralWorkSessionModel } = (0, tenant_request_context_1.requireTenantModels)();
        const { page, size, sortBy, order } = params;
        const offset = (page - 1) * size;
        const where = { is_active: true };
        if (params.ranch_uuid) {
            where.ranch_uuid = params.ranch_uuid;
        }
        if (params.paddock_uuid) {
            where.paddock_uuid = params.paddock_uuid;
        }
        if (params.status) {
            where.status = params.status;
        }
        if (params.work_date) {
            where.work_date = params.work_date;
        }
        const sortColumn = sortBy === 'work_date' ? 'work_date' : 'created_at';
        return CorralWorkSessionModel.findAndCountAll({
            where,
            offset,
            limit: size,
            order: [[sortColumn, order]],
        });
    }
    async findById(uuid_corral_work_session) {
        const { CorralWorkSessionModel } = (0, tenant_request_context_1.requireTenantModels)();
        return CorralWorkSessionModel.findOne({
            where: { uuid_corral_work_session, is_active: true },
        });
    }
    async create(data) {
        const { CorralWorkSessionModel } = (0, tenant_request_context_1.requireTenantModels)();
        return CorralWorkSessionModel.create(data);
    }
    async update(uuid_corral_work_session, data) {
        const { CorralWorkSessionModel } = (0, tenant_request_context_1.requireTenantModels)();
        const [count, updated] = await CorralWorkSessionModel.update(data, {
            where: { uuid_corral_work_session, is_active: true },
            returning: true,
        });
        if (count === 0) {
            return null;
        }
        return updated[0];
    }
    async findPlannedActivities(uuid_corral_work_session) {
        const { WorkSessionPlannedActivityModel } = (0, tenant_request_context_1.requireTenantModels)();
        const rows = await WorkSessionPlannedActivityModel.findAll({
            where: { uuid_corral_work_session, is_active: true },
            attributes: ['activity_type'],
        });
        return rows.map((row) => row.get('activity_type'));
    }
    async replacePlannedActivities(uuid_corral_work_session, activityTypes) {
        const { WorkSessionPlannedActivityModel } = (0, tenant_request_context_1.requireTenantModels)();
        await WorkSessionPlannedActivityModel.update({ is_active: false }, { where: { uuid_corral_work_session, is_active: true } });
        if (activityTypes.length === 0) {
            return;
        }
        const payload = activityTypes.map((activity_type) => ({
            uuid_corral_work_session,
            activity_type,
        }));
        await WorkSessionPlannedActivityModel.bulkCreate(payload);
    }
    async createPlannedActivities(uuid_corral_work_session, activityTypes) {
        const { WorkSessionPlannedActivityModel } = (0, tenant_request_context_1.requireTenantModels)();
        const payload = activityTypes.map((activity_type) => ({
            uuid_corral_work_session,
            activity_type,
        }));
        return WorkSessionPlannedActivityModel.bulkCreate(payload);
    }
}
exports.default = CorralWorkSessionRepository;
