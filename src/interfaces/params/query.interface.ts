export type Order = 'ASC' | 'DESC';
export type Status = 'all' | 'active' | 'inactive';

export interface IBaseParams {
    page: number;
    size: number;
    sortBy: string;
    order: Order;
    status?: Status;
    uuid_company?: string;
}

export interface PaginationQuery {
    page?: string;
    size?: string;
    sortBy?: string;
    order?: string;
}

export interface StatusQuery {
    status?: string;
}

export interface IncludeInactiveQuery {
    includeInactive?: string;
}

export interface GetAllQuery extends PaginationQuery, StatusQuery {}