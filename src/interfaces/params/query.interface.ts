export type Order = 'ASC' | 'DESC';
export type Status = 'all' | 'active' | 'inactive';

export interface IBaseParams {
    page: number;
    size: number;
    sortBy: string;
    order: Order;
    status?: Status;
    uuid_company?: string;
    /** Limitar listados a ranchos concretos (alcance single_ranch). */
    uuid_ranch_in?: string[];
    /** Case-insensitive partial match across resource-specific text fields. */
    search?: string;
    /** Animal list filter: MALE | FEMALE (omit or ALL for no filter). */
    sex?: string;
}

export interface SearchQuery {
    search?: string;
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