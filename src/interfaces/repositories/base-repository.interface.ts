import { IBaseParams } from "../params/query.interface";

export interface PaginatedResult<T> {
    rows: T[];
    count: number;
}

export interface IBaseRepository<T, C> {
    findById(params: { id: string; includeInactive?: boolean; uuid_company?: string; uuid_ranch_in?: string[] }): Promise<T | null>;
    findAll(params: IBaseParams): Promise<PaginatedResult<T>>;
    create(data: C): Promise<T>;
    update(id: string, data: C, options?: { uuid_company?: string }): Promise<T | null>;
    delete(id: string, options?: { uuid_company?: string }): Promise<boolean>;
}

