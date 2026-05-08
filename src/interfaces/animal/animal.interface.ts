import { Optional } from "sequelize";

export type AnimalSex = 'MALE' | 'FEMALE';
export type AnimalOriginType = 'BIRTH' | 'PURCHASE' | 'TRANSFER' | 'UNKNOWN';
export type AnimalCurrentStatus = 'ACTIVE' | 'SOLD' | 'DISPOSED' | 'DEAD' | 'MISSING' | 'INACTIVE';

export interface AnimalAttributes {
    animal_uuid: string;
    uuid_company: string;
    ranch_uuid: string;
    breed_uuid: string;
    mother_animal_uuid?: string | null;
    father_animal_uuid?: string | null;
    current_owner_uuid?: string | null;
    sex: AnimalSex;
    color?: string | null;
    birth_date?: Date | null;
    origin_type: AnimalOriginType;
    current_status: AnimalCurrentStatus;
    description?: string | null;
    current_paddock_uuid?: string | null;
    current_weight?: number | null;
    is_active: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export type AnimalCreationAttributes = Optional<
    AnimalAttributes,
    | 'animal_uuid'
    | 'mother_animal_uuid'
    | 'father_animal_uuid'
    | 'current_owner_uuid'
    | 'color'
    | 'birth_date'
    | 'description'
    | 'current_paddock_uuid'
    | 'current_weight'
    | 'is_active'
    | 'created_at'
    | 'updated_at'
>;
