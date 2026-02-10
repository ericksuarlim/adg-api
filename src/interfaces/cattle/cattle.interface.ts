import { Optional } from "sequelize";

export interface CattleAttributes {
    uuid_cattle: number;
    primary_tag_number: string;
    secondary_tag_number: string;
    birthdate: Date;
    sex: string;
    status: boolean;
    color: string;
    detail: string;
    created_at: Date;
    updated_at: Date;
    uuid_breed: number;
    uuid_location: number;
}

export type CattleCreationAttributes = Optional<CattleAttributes, 'uuid_cattle'>;