import { UserRole } from "../roles/roles.interface";

export interface JwtPayload {
    sub: string;
    username: string;
    uuid_company: string;
    roles: UserRole[];
    membership_status?: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED';
    membership_renewal_at?: string | null;
    session_id?: string;
    iat?: number;
    exp?: number;
}