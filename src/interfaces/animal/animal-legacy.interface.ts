import { Optional } from "sequelize";

export interface AnimalLegacyAttributes {
    uuid_animal: string;
    primary_tag_number?: string | null;
    secondary_tag_number?: string | null;
    birthdate?: Date | null;
    sex?: string | null;
    status?: boolean | null;
    color?: string | null;
    detail?: string | null;
    created_at?: Date;
    updated_at?: Date;
    uuid_breed?: string | null;
    uuid_location?: string | null;
    is_active: boolean;
}

export type AnimalLegacyCreationAttributes = Optional<
    AnimalLegacyAttributes,
    'uuid_animal' | 'is_active' | 'created_at' | 'updated_at'
>;
