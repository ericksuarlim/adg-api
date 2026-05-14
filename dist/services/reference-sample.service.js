"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apiError_1 = __importDefault(require("../errors/apiError"));
const httpStatusCodes_1 = __importDefault(require("../errors/httpStatusCodes"));
class ReferenceSampleService {
    constructor(referenceSampleRepository) {
        this.referenceSampleRepository = referenceSampleRepository;
    }
    async getAll(params) {
        const { rows, count } = await this.referenceSampleRepository.findAll(params);
        const plainRows = rows.map((row) => row.get({ plain: true }));
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
        if (!body.title || body.title.trim() === '') {
            throw new apiError_1.default({
                name: 'ValidationError',
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: 'Title is required'
            });
        }
        const created = await this.referenceSampleRepository.create(body);
        return {
            success: true,
            data: created.get({ plain: true })
        };
    }
    async getById(params) {
        const { id, includeInactive, uuid_company } = params;
        if (!id || id.trim() === '') {
            throw new apiError_1.default({
                name: 'ValidationError',
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: 'Reference sample id is required'
            });
        }
        const row = await this.referenceSampleRepository.findById({
            id,
            includeInactive,
            uuid_company
        });
        if (!row) {
            throw new apiError_1.default({
                name: 'NotFound',
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
                description: 'Reference sample not found'
            });
        }
        return {
            success: true,
            data: row.get({ plain: true })
        };
    }
    async update(id, body, tenantContext) {
        if (!id || id.trim() === '') {
            throw new apiError_1.default({
                name: 'ValidationError',
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: 'Reference sample id is required'
            });
        }
        const updated = await this.referenceSampleRepository.update(id, body, tenantContext);
        if (!updated) {
            throw new apiError_1.default({
                name: 'NotFound',
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
                description: 'Reference sample not found'
            });
        }
        return {
            success: true,
            data: updated.get({ plain: true })
        };
    }
    async delete(id, tenantContext) {
        if (!id || id.trim() === '') {
            throw new apiError_1.default({
                name: 'ValidationError',
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: 'Reference sample id is required'
            });
        }
        const deleted = await this.referenceSampleRepository.delete(id, tenantContext);
        if (!deleted) {
            throw new apiError_1.default({
                name: 'NotFound',
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
                description: 'Reference sample not found'
            });
        }
        return {
            success: true,
            data: null
        };
    }
}
exports.default = ReferenceSampleService;
