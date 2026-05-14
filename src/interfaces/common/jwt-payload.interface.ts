import { UserRole } from "../roles/roles.interface";
import { MembershipStatus } from "../../constants/domain.constants";

export type AccessScope = "saas_global" | "company_all_ranches" | "single_ranch";

export interface JwtPayload {
    sub: string;
    username: string;
    uuid_company: string;
    roles: UserRole[];
    access_scope?: AccessScope;
    ranch_uuids?: string[];
    membership_status?: MembershipStatus;
    membership_renewal_at?: string | null;
    session_id?: string;
    iat?: number;
    exp?: number;
}