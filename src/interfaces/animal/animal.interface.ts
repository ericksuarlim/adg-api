import { Optional } from "sequelize";

export type AnimalSex = 'MALE' | 'FEMALE';
export type AnimalOriginType = 'BIRTH' | 'PURCHASE' | 'TRANSFER' | 'UNKNOWN';
export type AnimalCurrentStatus = 'ACTIVE' | 'SOLD' | 'DISPOSED' | 'DEAD' | 'MISSING' | 'INACTIVE';

export interface AnimalAttributes {
    animal_uuid: string;
    ranch_uuid: string;
    /** Controlled vocabulary; see `cattle-breed.constants`. Optional. */
    breed_code?: string | null;
    registration_number: string;
    /** Ear tag / RFID; optional and unique per ranch when set. */
    chip_number?: string | null;
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
    | 'breed_code'
    | 'mother_animal_uuid'
    | 'father_animal_uuid'
    | 'current_owner_uuid'
    | 'chip_number'
    | 'color'
    | 'description'
    | 'current_paddock_uuid'
    | 'is_active'
    | 'current_status'
    | 'created_at'
    | 'updated_at'
>;
