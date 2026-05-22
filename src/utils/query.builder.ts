import { parseNumber, parseOrder, parseStatus, parseBoolean } from "./query.parser";
import { IBaseParams } from "../interfaces/params/query.interface";

function parseSearch(query: Record<string, unknown>): string | undefined {
    const raw = query.search;
    if (typeof raw !== "string") {
        return undefined;
    }
    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}

export function buildGetAllParams(query: any): IBaseParams {
    return {
        page: parseNumber(query.page, 1),
        size: parseNumber(query.size, 10),
        sortBy: query.sortBy || 'createdAt',
        order: parseOrder(query.order),
        status: parseStatus(query.status),
        uuid_company: undefined,
        search: parseSearch(query),
    };
}

export function buildGetByIdParams(query: any) {
    return {
        includeInactive: parseBoolean(query.includeInactive ?? false)
    };
}
