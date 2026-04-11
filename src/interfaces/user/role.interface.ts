import { Optional } from "sequelize";

export interface RoleAttributes {
    role_id: number;
    name: string;
    description?: string | null;
}

export type RoleCreationAttributes = Optional<RoleAttributes, 'role_id' | 'description'>;
