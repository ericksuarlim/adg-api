import { Optional } from "sequelize";

export interface UserAttributes {
    uuid_user: number;
    id_card: number;
    names: string;
    first_last_name: string;
    second_last_name?: string;
    email: string;
    user_name: string;
    password: string;
    role: string;
    is_active: boolean;
    cell_phone?: number;
}

export type UserCreationAttributes = Optional<UserAttributes, 'uuid_user'>;
