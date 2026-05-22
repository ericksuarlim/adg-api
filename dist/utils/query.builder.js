"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildGetAllParams = buildGetAllParams;
exports.buildGetByIdParams = buildGetByIdParams;
const query_parser_1 = require("./query.parser");
function parseSearch(query) {
    const raw = query.search;
    if (typeof raw !== "string") {
        return undefined;
    }
    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}
function buildGetAllParams(query) {
    return {
        page: (0, query_parser_1.parseNumber)(query.page, 1),
        size: (0, query_parser_1.parseNumber)(query.size, 10),
        sortBy: query.sortBy || 'createdAt',
        order: (0, query_parser_1.parseOrder)(query.order),
        status: (0, query_parser_1.parseStatus)(query.status),
        uuid_company: undefined,
        search: parseSearch(query),
    };
}
function buildGetByIdParams(query) {
    return {
        includeInactive: (0, query_parser_1.parseBoolean)(query.includeInactive ?? false)
    };
}
