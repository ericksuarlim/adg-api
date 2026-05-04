import { Optional } from "sequelize";
import {UserRole} from "../roles/roles.interface";

export interface UserRanchAttributes {
    user_ranch_id: number;
    uuid_user: string;
    uuid_ranch: string;
    role: UserRole;
    is_active: boolean;
}

export type UserRanchCreationAttributes = Optional<UserRanchAttributes, 'user_ranch_id' | 'is_active'>;
