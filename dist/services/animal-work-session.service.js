"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apiError_1 = __importDefault(require("../errors/apiError"));
const httpStatusCodes_1 = __importDefault(require("../errors/httpStatusCodes"));
class AnimalWorkSessionService {
    constructor(repository) {
        this.repository = repository;
    }
    async getAll(params) {
        const { rows, count } = await this.repository.findAll(params);
        const plainRows = rows.map(item => item.get({ plain: true }));
        return {
            success: true,
            data: plainRows,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / params.size),
                currentPage: params.page,
                order: params.order,
                pageSize: params.size
            }
        };
    }
    async create(body, _options) {
        const created = await this.repository.create(body);
        return { success: true, data: created.get({ plain: true }) };
    }
    async getById(params) {
        const { id } = params;
        if (!id || id.trim() === '') {
            throw new apiError_1.default({
                name: 'ValidationError',
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: 'Work session ID is required'
            });
        }
        const item = await this.repository.findById({ id });
        if (!item) {
            throw new apiError_1.default({
                name: 'NotFound',
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
                description: 'Work session not found'
            });
        }
        return { success: true, data: item.get({ plain: true }) };
    }
    async update(id, body, tenantContext) {
        if (!id || id.trim() === '') {
            throw new apiError_1.default({
                name: 'ValidationError',
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: 'Work session ID is required'
            });
        }
        const updated = await this.repository.update(id, body, tenantContext);
        if (!updated) {
            throw new apiError_1.default({
                name: 'NotFound',
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
                description: 'Work session not found'
            });
        }
        return { success: true, data: updated.get({ plain: true }) };
    }
    async delete(id, tenantContext) {
        if (!id || id.trim() === '') {
            throw new apiError_1.default({
                name: 'ValidationError',
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: 'Work session ID is required'
            });
        }
        const deleted = await this.repository.delete(id, tenantContext);
        if (!deleted) {
            throw new apiError_1.default({
                name: 'NotFound',
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
                description: 'Work session not found'
            });
        }
        return { success: true, data: null };
    }
}
exports.default = AnimalWorkSessionService;
