import { Order, Status } from "../interfaces/params/query.interface";

type QueryValue = string | string[] | undefined;

export function parseNumber(value: QueryValue, defaultValue: number): number {
    if (Array.isArray(value)) return defaultValue;

    const parsed = parseInt(value ?? '');
    return isNaN(parsed) ? defaultValue : parsed;
}

export function parseBoolean(value: QueryValue): boolean {
    if (Array.isArray(value)) return false;
    return value === 'true';
}

export function parseOrder(value: QueryValue): Order {
    if (Array.isArray(value)) return 'DESC';
    return value?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
}

export function parseStatus(value: QueryValue): Status {
    if (Array.isArray(value)) return 'active';
    if (value === 'inactive') return 'inactive';
    if (value === 'all') return 'all';
    return 'active';
}
