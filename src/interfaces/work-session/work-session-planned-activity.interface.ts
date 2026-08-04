import { Optional } from 'sequelize';
import { CorralPlannedActivityType } from '../../constants/corral-work-session.constants';

export interface WorkSessionPlannedActivityAttributes {
    uuid_work_session_planned_activity: string;
    uuid_corral_work_session: string;
    activity_type: CorralPlannedActivityType;
    is_active: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export type WorkSessionPlannedActivityCreationAttributes = Optional<
    WorkSessionPlannedActivityAttributes,
    'uuid_work_session_planned_activity' | 'is_active' | 'created_at' | 'updated_at'
>;
