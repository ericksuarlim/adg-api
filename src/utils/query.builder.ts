import { parseNumber, parseOrder, parseStatus, parseBoolean } from "./query.parser";
import { IBaseParams } from "../interfaces/params/query.interface";

export function buildGetAllParams(query: any): IBaseParams {
    return {
        page: parseNumber(query.page, 1),
        size: parseNumber(query.size, 10),
        sortBy: query.sortBy || 'createdAt',
        order: parseOrder(query.order),
        status: parseStatus(query.status),
        uuid_company: undefined
    };
}

export function buildGetByIdParams(query: any) {
    return {
        includeInactive: parseBoolean(query.includeInactive ?? false)
    };
}
