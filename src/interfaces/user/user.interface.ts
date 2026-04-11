import { Optional } from "sequelize";

export interface UserAttributes {
    uuid_user: string;
    company_id: string,

    id_card: string;
    first_name: string;
    last_name: string;
    second_last_name?: string | null;

    email: string;
    username: string;
    password: string;

    phone?: string | null;
    is_active: boolean;

    created_at?: Date;
    updated_at?: Date;
}

export type UserCreationAttributes = Optional<UserAttributes, 'uuid_user' | 'phone' | 'second_last_name' |'is_active' | 'created_at' | 'updated_at'>;
