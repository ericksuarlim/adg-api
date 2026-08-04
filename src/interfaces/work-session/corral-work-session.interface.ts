import { Optional } from 'sequelize';
import { CorralPlannedActivityType, CorralWorkSessionStatus } from '../../constants/corral-work-session.constants';

export interface CorralWorkSessionAttributes {
    uuid_corral_work_session: string;
    ranch_uuid: string;
    paddock_uuid: string;
    work_date: Date;
    status: CorralWorkSessionStatus;
    notes?: string | null;
    planned_medicine_uuid?: string | null;
    created_by?: string | null;
    started_at?: Date | null;
    closed_at?: Date | null;
    is_active: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export type CorralWorkSessionCreationAttributes = Optional<
    CorralWorkSessionAttributes,
    | 'uuid_corral_work_session'
    | 'status'
    | 'notes'
    | 'planned_medicine_uuid'
    | 'created_by'
    | 'started_at'
    | 'closed_at'
    | 'is_active'
    | 'created_at'
    | 'updated_at'
>;

export interface CorralWorkSessionDetailAttributes extends CorralWorkSessionAttributes {
    planned_activities: CorralPlannedActivityType[];
}

export interface CreateCorralWorkSessionBody {
    ranch_uuid: string;
    paddock_uuid: string;
    work_date: string;
    notes?: string | null;
    planned_activities: CorralPlannedActivityType[];
    planned_medicine_uuid?: string | null;
    created_by?: string | null;
}
