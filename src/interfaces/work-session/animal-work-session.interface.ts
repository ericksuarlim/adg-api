import { Optional } from 'sequelize';

export interface AnimalWorkSessionAttributes {
    id_animal_work: number;
    uuid_animal: string;
    work_session_id: string;
    attended: boolean;
    condition: string;
    observation: string;
    received_medical: boolean;
    created_at: Date;
    is_active: boolean;
}

export type AnimalWorkSessionCreationAttributes = Optional<
    AnimalWorkSessionAttributes,
    'id_animal_work' | 'created_at' | 'is_active'
>;
