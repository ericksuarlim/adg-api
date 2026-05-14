import { ServiceResponse } from "../common/service-response.interface";
import { IBaseParams } from "../params/query.interface";
import { UserRole } from "../roles/roles.interface";
import { UserRanchAttributes } from '../ranch/user-ranch.interface';

export type MembershipTenantOptions = { allowCrossTenant?: boolean; actorRoles?: UserRole[] };

/** Body for POST /membership — company-scoped role (uuid_ranch ignored if sent). */
export type CompanyMembershipAssignBody = {
    uuid_user: string;
    role: UserRole;
    uuid_ranch?: string;
};

export interface IMembershipService {
    assignCompanyRole(
        data: CompanyMembershipAssignBody,
        uuid_company: string,
        options?: MembershipTenantOptions
    ): Promise<ServiceResponse<UserRanchAttributes>>;
    changeCompanyUserRole(
        uuid_user: string,
        role: UserRole,
        uuid_company: string,
        options?: MembershipTenantOptions
    ): Promise<ServiceResponse<UserRanchAttributes>>;
    removeUserFromCompany(
        uuid_user: string,
        uuid_company: string,
        options?: MembershipTenantOptions
    ): Promise<ServiceResponse<null>>;
    getUsersByRanch(
        uuid_ranch: string,
        params: IBaseParams,
        uuid_company: string,
        options?: MembershipTenantOptions
    ): Promise<ServiceResponse<UserRanchAttributes[]>>;
    getRanchesByUser(
        uuid_user: string,
        params: IBaseParams,
        uuid_company: string,
        options?: MembershipTenantOptions
    ): Promise<ServiceResponse<UserRanchAttributes[]>>;
    promoteUserToCompanyAdministrator(
        uuid_user: string,
        uuid_company: string,
        options?: MembershipTenantOptions
    ): Promise<ServiceResponse<null>>;
}
