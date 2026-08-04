import type { Model } from 'sequelize';
import { requireTenantModels } from '../database/tenant/tenant-request-context';
import {
    CorralWorkSessionAttributes,
    CorralWorkSessionCreationAttributes,
} from '../interfaces/work-session/corral-work-session.interface';
import {
    WorkSessionPlannedActivityCreationAttributes,
    WorkSessionPlannedActivityAttributes,
} from '../interfaces/work-session/work-session-planned-activity.interface';
import { CorralPlannedActivityType } from '../constants/corral-work-session.constants';

type CorralWorkSessionRow = Model<CorralWorkSessionAttributes, CorralWorkSessionCreationAttributes>;
type PlannedActivityRow = Model<WorkSessionPlannedActivityAttributes, WorkSessionPlannedActivityCreationAttributes>;

export interface CorralWorkSessionListParams {
    page: number;
    size: number;
    sortBy: string;
    order: 'ASC' | 'DESC';
    ranch_uuid?: string;
    paddock_uuid?: string;
    status?: string;
    work_date?: string;
}

class CorralWorkSessionRepository {
    async findAll(
        params: CorralWorkSessionListParams
    ): Promise<{ rows: CorralWorkSessionRow[]; count: number }> {
        const { CorralWorkSessionModel } = requireTenantModels();
        const { page, size, sortBy, order } = params;
        const offset = (page - 1) * size;
        const where: Record<string, unknown> = { is_active: true };

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

    async findById(uuid_corral_work_session: string): Promise<CorralWorkSessionRow | null> {
        const { CorralWorkSessionModel } = requireTenantModels();
        return CorralWorkSessionModel.findOne({
            where: { uuid_corral_work_session, is_active: true },
        });
    }

    async create(data: CorralWorkSessionCreationAttributes): Promise<CorralWorkSessionRow> {
        const { CorralWorkSessionModel } = requireTenantModels();
        return CorralWorkSessionModel.create(data);
    }

    async update(
        uuid_corral_work_session: string,
        data: Partial<CorralWorkSessionCreationAttributes>
    ): Promise<CorralWorkSessionRow | null> {
        const { CorralWorkSessionModel } = requireTenantModels();
        const [count, updated] = await CorralWorkSessionModel.update(data, {
            where: { uuid_corral_work_session, is_active: true },
            returning: true,
        });
        if (count === 0) {
            return null;
        }
        return updated[0];
    }

    async findPlannedActivities(uuid_corral_work_session: string): Promise<CorralPlannedActivityType[]> {
        const { WorkSessionPlannedActivityModel } = requireTenantModels();
        const rows = await WorkSessionPlannedActivityModel.findAll({
            where: { uuid_corral_work_session, is_active: true },
            attributes: ['activity_type'],
        });
        return rows.map((row) => row.get('activity_type') as CorralPlannedActivityType);
    }

    async replacePlannedActivities(
        uuid_corral_work_session: string,
        activityTypes: CorralPlannedActivityType[]
    ): Promise<void> {
        const { WorkSessionPlannedActivityModel } = requireTenantModels();
        await WorkSessionPlannedActivityModel.update(
            { is_active: false },
            { where: { uuid_corral_work_session, is_active: true } }
        );

        if (activityTypes.length === 0) {
            return;
        }

        const payload: WorkSessionPlannedActivityCreationAttributes[] = activityTypes.map((activity_type) => ({
            uuid_corral_work_session,
            activity_type,
        }));

        await WorkSessionPlannedActivityModel.bulkCreate(payload);
    }

    async createPlannedActivities(
        uuid_corral_work_session: string,
        activityTypes: CorralPlannedActivityType[]
    ): Promise<PlannedActivityRow[]> {
        const { WorkSessionPlannedActivityModel } = requireTenantModels();
        const payload: WorkSessionPlannedActivityCreationAttributes[] = activityTypes.map((activity_type) => ({
            uuid_corral_work_session,
            activity_type,
        }));
        return WorkSessionPlannedActivityModel.bulkCreate(payload);
    }
}

export default CorralWorkSessionRepository;
