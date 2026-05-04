import { Optional } from "sequelize";

export interface ReferenceSampleAttributes {
    uuid_reference_sample: string;
    uuid_company: string;
    title: string;
    description?: string | null;
    is_active: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export type ReferenceSampleCreationAttributes = Optional<
    ReferenceSampleAttributes,
    'uuid_reference_sample' | 'description' | 'is_active' | 'created_at' | 'updated_at'
>;
