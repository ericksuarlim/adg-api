import { ServiceResponse } from "../common/service-response.interface";
import {IBaseParams} from "../params/query.interface";
import {UserRole} from "../roles/roles.interface";

export interface IMembershipService<T, C> {
    assignUserToRanch(data: C, uuid_company: string): Promise<ServiceResponse<T>>;
    changeRole(uuid_user: string, uuid_ranch: string, role: UserRole, uuid_company: string): Promise<ServiceResponse<T>>;
    removeUserFromRanch(uuid_user: string, uuid_ranch: string, uuid_company: string): Promise<ServiceResponse<null>>;
    getUsersByRanch(uuid_ranch: string, params: IBaseParams, uuid_company: string): Promise<ServiceResponse<T[]>>;
    getRanchesByUser(uuid_user: string, params: IBaseParams, uuid_company: string): Promise<ServiceResponse<T[]>>;
}