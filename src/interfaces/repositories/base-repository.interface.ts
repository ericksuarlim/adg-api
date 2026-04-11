import {Status} from "../params/query.interface";

export interface PaginatedResult<T> {
    rows: T[];
    count: number;
}

export interface IBaseRepository<T, C> {
    findById(params: { id: string, includeInactive?: boolean }): Promise<T | null>;
    findAll(params: {
        page: number;
        size: number;
        sortBy: string;
        order: 'ASC' | 'DESC';
        status?: Status;
    }): Promise<PaginatedResult<T>>;
    create(data: C): Promise<T>;
    update(id: string, data: C): Promise<T | null>;
    delete(id: string): Promise<boolean>;
}

