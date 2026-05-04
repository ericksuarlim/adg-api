import { Order, Status } from "../interfaces/params/query.interface";

type QueryValue = string | string[] | undefined;

export function parseNumber(value: QueryValue, defaultValue: number): number {
    if (Array.isArray(value)) return defaultValue;

    const parsed = parseInt(value ?? '');
    return isNaN(parsed) ? defaultValue : parsed;
}

export function parseBoolean(value: unknown): boolean {
    if (Array.isArray(value)) return false;

    if (typeof value === 'boolean') return value;

    if (typeof value === 'string') {
        const normalized = value.toLowerCase();
        return normalized === 'true' || normalized === '1';
    }

    if (typeof value === 'number') {
        return value === 1;
    }

    return false;
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
