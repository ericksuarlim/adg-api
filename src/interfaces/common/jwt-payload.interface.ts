import { UserRole } from "../roles/roles.interface";

export interface JwtPayload {
    sub: string;
    username: string;
    uuid_company: string;
    roles: UserRole[];
    session_id?: string;
    iat?: number;
    exp?: number;
}