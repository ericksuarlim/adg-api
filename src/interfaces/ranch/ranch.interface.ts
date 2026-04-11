import { Optional } from "sequelize";

export interface RanchAttributes {
    uuid_ranch: string;
    uuid_company: string;
    name: string;
    location?: string | null;
    area?: string | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export type RanchCreationAttributes = Optional<RanchAttributes, 'uuid_ranch' | 'location' | 'area' | 'is_active' | 'created_at' | 'updated_at'>;
