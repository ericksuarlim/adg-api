import { Optional } from "sequelize";
import { UserRole } from "../roles/roles.interface";

export interface UserAttributes {
    uuid_user: string;
    uuid_company: string,

    id_card: string;
    first_name: string;
    last_name: string;
    second_last_name?: string | null;

    email: string;
    username: string;
    password: string;

    phone?: string | null;
    is_active: boolean;
    role: UserRole;

    created_at?: Date;
    updated_at?: Date;
}

export type UserCreationAttributes = Optional<UserAttributes, 'uuid_user' | 'phone' | 'second_last_name' |'is_active' | 'created_at' | 'updated_at' | 'role'>;
