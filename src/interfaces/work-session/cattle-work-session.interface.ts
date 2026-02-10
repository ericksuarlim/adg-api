import { Optional } from 'sequelize';

export interface CattleWorkSessionAttributes {
    id_cattle_work: number;
    uuid_cattle: string;
    work_session_id: string;
    attended: boolean;
    condition: string;
    observation: string;
    received_medical: boolean;
    created_at: Date;
}

export type CattleWorkSessionCreationAttributes = Optional<CattleWorkSessionAttributes, 'id_cattle_work' | 'created_at'>;
