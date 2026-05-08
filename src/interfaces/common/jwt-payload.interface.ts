import { UserRole } from "../roles/roles.interface";
import { MembershipStatus } from "../../constants/domain.constants";

export interface JwtPayload {
    sub: string;
    username: string;
    uuid_company: string;
    roles: UserRole[];
    membership_status?: MembershipStatus;
    membership_renewal_at?: string | null;
    session_id?: string;
    iat?: number;
    exp?: number;
}