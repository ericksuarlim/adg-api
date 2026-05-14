import { ServiceResponse } from "../common/service-response.interface";
import {IBaseParams} from "../params/query.interface";
import {UserRole} from "../roles/roles.interface";

export type MembershipTenantOptions = { allowCrossTenant?: boolean };

export interface IMembershipService<T, C> {
    assignUserToRanch(data: C, uuid_company: string, options?: MembershipTenantOptions): Promise<ServiceResponse<T>>;
    changeRole(uuid_user: string, uuid_ranch: string, role: UserRole, uuid_company: string, options?: MembershipTenantOptions): Promise<ServiceResponse<T>>;
    removeUserFromRanch(uuid_user: string, uuid_ranch: string, uuid_company: string, options?: MembershipTenantOptions): Promise<ServiceResponse<null>>;
    getUsersByRanch(uuid_ranch: string, params: IBaseParams, uuid_company: string, options?: MembershipTenantOptions): Promise<ServiceResponse<T[]>>;
    getRanchesByUser(uuid_user: string, params: IBaseParams, uuid_company: string, options?: MembershipTenantOptions): Promise<ServiceResponse<T[]>>;
    /** Tras crear un rancho: asigna administradores existentes de la empresa al nuevo rancho. */
    syncCompanyAdministratorsToNewRanch(uuid_ranch: string, jwtCompany: string, options?: MembershipTenantOptions): Promise<void>;
    /** Administrador en todos los ranchos activos de la empresa (sin depender de un rancho concreto en el cliente). */
    promoteUserToCompanyAdministrator(uuid_user: string, jwtCompany: string, options?: MembershipTenantOptions): Promise<ServiceResponse<null>>;
}