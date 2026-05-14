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
    findActiveRanchIdsByUser(uuid_user: string, uuid_company: string): Promise<string[]>;
    countActiveMembershipsForUserInCompany(
        uuid_user: string,
        uuid_company: string,
        excludeRanchId?: string
    ): Promise<number>;
    /** Usuarios con al menos una membresía activa de administrador en algún rancho de la empresa. */
    findUserIdsWithActiveAdministratorInCompany(uuid_company: string): Promise<string[]>;
    /** Crea o reactiva fila con rol indicado (evita duplicar uuid_user+uuid_ranch). */
    upsertActiveMembership(uuid_user: string, uuid_ranch: string, role: UserRole): Promise<T>;
}