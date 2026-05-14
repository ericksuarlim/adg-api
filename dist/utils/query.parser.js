"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseNumber = parseNumber;
exports.parseBoolean = parseBoolean;
exports.parseOrder = parseOrder;
exports.parseStatus = parseStatus;
function parseNumber(value, defaultValue) {
    if (Array.isArray(value))
        return defaultValue;
    const parsed = parseInt(value ?? '');
    return isNaN(parsed) ? defaultValue : parsed;
}
function parseBoolean(value) {
    if (Array.isArray(value))
        return false;
    if (typeof value === 'boolean')
        return value;
    if (typeof value === 'string') {
        const normalized = value.toLowerCase();
        return normalized === 'true' || normalized === '1';
    }
    if (typeof value === 'number') {
        return value === 1;
    }
    return false;
}
function parseOrder(value) {
    if (Array.isArray(value))
        return 'DESC';
    return value?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
}
function parseStatus(value) {
    if (Array.isArray(value))
        return 'active';
    if (value === 'inactive')
        return 'inactive';
    if (value === 'all')
        return 'all';
    return 'active';
}
