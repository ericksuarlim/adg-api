import { Optional } from "sequelize";

export interface SessionAttributes {
    uuid_session: number;
    user_name?: string;
    user_token?: string;
    active?: boolean;
    login_date?: Date;
}

export type SessionCreationAttributes = Optional<SessionAttributes, 'uuid_session'>;
