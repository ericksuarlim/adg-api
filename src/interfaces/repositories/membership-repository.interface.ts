import {PaginatedResult} from "./base-repository.interface";
import {IBaseParams} from "../params/query.interface";
import {UserRole} from "../roles/roles.interface";

export interface IMembershipRepository<T, C> {
    create(data: C): Promise<T>;
    findMembership(uuid_user: string, uuid_ranch: string): Promise<T | null>;
    updateRole(uuid_user: string, uuid_ranch: string, role: UserRole): Promise<T | null>;
    remove(uuid_user: string, uuid_ranch: string): Promise<boolean>;
    findUsersByRanch(uuid_ranch: string, params: IBaseParams): Promise<PaginatedResult<T>>;
    findRanchesByUser(uuid_user: string, params: IBaseParams): Promise<PaginatedResult<T>>;
    findActiveRolesByUser(uuid_user: string, uuid_company: string): Promise<UserRole[]>;
}