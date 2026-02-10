import { Optional } from 'sequelize';

export interface CattleWorkRecordAttributes {
    id_cattle_work: number;
    uuid_cattle: string;
    work_session_id: string;
    attended: boolean;
    condition: string;
    observation: string;
    received_medical: boolean;
    created_at: Date;
}

export type CattleWorkRecordCreationAttributes = Optional<CattleWorkRecordAttributes, 'id_cattle_work' | 'created_at'>;
