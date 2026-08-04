import { Optional } from 'sequelize';

export interface AnimalWorkSessionAttributes {
    id_animal_work: number;
    uuid_corral_work_session: string;
    uuid_animal: string;
    attended: boolean;
    condition: string;
    observation: string;
    received_medical: boolean;
    medicine_uuid?: string | null;
    created_at: Date;
    is_active: boolean;
}

export type AnimalWorkSessionCreationAttributes = Optional<
    AnimalWorkSessionAttributes,
    'id_animal_work' | 'created_at' | 'is_active' | 'medicine_uuid'
>;

export interface UpsertAnimalWorkRecordBody {
    uuid_animal?: string;
    animal_identifier?: string;
    attended?: boolean;
    condition?: string;
    observation?: string;
    received_medical?: boolean;
    medicine_uuid?: string | null;
}

export interface AnimalWorkRecordWithAnimalAttributes extends AnimalWorkSessionAttributes {
    registration_number?: string;
    chip_number?: string | null;
}
