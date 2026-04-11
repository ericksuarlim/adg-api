import { parseNumber, parseOrder, parseStatus, parseBoolean } from "./query.parser";

export function buildGetAllParams(query: any) {
    return {
        page: parseNumber(query.page, 1),
        size: parseNumber(query.size, 10),
        sortBy: query.sortBy || 'createdAt',
        order: parseOrder(query.order),
        status: parseStatus(query.status)
    };
}

export function buildGetByIdParams(query: any) {
    return {
        includeInactive: parseBoolean(!query.includeInactive ? 'true' : 'false')
    };
}
