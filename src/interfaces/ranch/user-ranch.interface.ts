import { Optional } from "sequelize";

export interface UserRanchAttributes {
    user_ranch_id: string;
    uuid_user: string;
    uuid_ranch: string;
    role_id: number;
    is_active: boolean;
}

export type UserRanchCreationAttributes = Optional<UserRanchAttributes, 'user_ranch_id' | 'is_active'>;
