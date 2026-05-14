import { Optional } from "sequelize";

export type AnimalSex = 'MALE' | 'FEMALE';
export type AnimalOriginType = 'BIRTH' | 'PURCHASE' | 'TRANSFER' | 'UNKNOWN';
export type AnimalCurrentStatus = 'ACTIVE' | 'SOLD' | 'DISPOSED' | 'DEAD' | 'MISSING' | 'INACTIVE';

export interface AnimalAttributes {
    animal_uuid: string;
    ranch_uuid: string;
    /** Controlled vocabulary; see `cattle-breed.constants`. */
    breed_code: string;
    registration_number: string;
    mother_animal_uuid?: string | null;
    father_animal_uuid?: string | null;
    current_owner_uuid?: string | null;
    sex: AnimalSex;
    color?: string | null;
    birth_date: Date;
    origin_type: AnimalOriginType;
    current_status: AnimalCurrentStatus;
    description?: string | null;
    current_paddock_uuid?: string | null;
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
    | 'description'
    | 'current_paddock_uuid'
    | 'is_active'
    | 'current_status'
    | 'created_at'
    | 'updated_at'
>;
