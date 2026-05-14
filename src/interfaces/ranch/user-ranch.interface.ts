import { Optional } from "sequelize";
import {UserRole} from "../roles/roles.interface";

export interface UserRanchAttributes {
    user_ranch_id: number;
    uuid_user: string;
    uuid_ranch: string;
    /** Denormalized company scope; avoids cross-DB joins to ranches for auth and membership queries. */
    uuid_company?: string | null;
    role: UserRole;
    is_active: boolean;
}

export type UserRanchCreationAttributes = Optional<UserRanchAttributes, 'user_ranch_id' | 'is_active' | 'uuid_company'>;
