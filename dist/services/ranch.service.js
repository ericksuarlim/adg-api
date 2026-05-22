"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apiError_1 = __importDefault(require("../errors/apiError"));
const httpStatusCodes_1 = __importDefault(require("../errors/httpStatusCodes"));
const paddock_repository_1 = __importDefault(require("../repositories/paddock.repository"));
const models_1 = require("../database/models");
class RanchService {
    constructor(ranchRepository, paddockRepository) {
        this.ranchRepository = ranchRepository;
        this.paddockRepository = paddockRepository ?? new paddock_repository_1.default();
    }
    async getAll(params) {
        const { rows, count } = await this.ranchRepository.findAll(params);
        const plainRanches = rows.map(ranch => ranch.get({ plain: true }));
        return {
            success: true,
            data: plainRanches,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / params.size),
                currentPage: params.page,
                order: params.order,
                pageSize: params.size
            }
        };
    }
    async create(ranchBody, _options) {
        const ranch = await this.ranchRepository.create(ranchBody);
        const plain = ranch.get({ plain: true });
        await models_1.RanchCompanyRouteModel.create({
            uuid_ranch: plain.uuid_ranch,
            uuid_company: plain.uuid_company,
        });
        return {
            success: true,
            data: plain
        };
    }
    async getById(params) {
        const { id: uuid_ranch, includeInactive, uuid_company, uuid_ranch_in } = params;
        if (!uuid_ranch || uuid_ranch.trim() === '') {
            throw new apiError_1.default({
                name: 'ValidationError',
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: 'uuid_ranch is required'
            });
        }
        const ranch = await this.ranchRepository.findById({ id: uuid_ranch, includeInactive, uuid_company, uuid_ranch_in });
        if (!ranch) {
            throw new apiError_1.default({
                name: 'NotFound',
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
                description: 'Ranch not found'
            });
        }
        return {
            success: true,
            data: ranch.get({ plain: true })
        };
    }
    async update(uuid_ranch, ranchBody, tenantContext) {
        if (!uuid_ranch || uuid_ranch.trim() === '') {
            throw new apiError_1.default({
                name: 'ValidationError',
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: 'uuid_ranch is required'
            });
        }
        const updatedRanch = await this.ranchRepository.update(uuid_ranch, ranchBody, tenantContext);
        if (!updatedRanch) {
            throw new apiError_1.default({
                name: 'NotFound',
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
                description: 'Problem updating ranch'
            });
        }
        return {
            success: true,
            data: updatedRanch.get({ plain: true })
        };
    }
    async delete(uuid_ranch, tenantContext) {
        if (!uuid_ranch || uuid_ranch.trim() === '') {
            throw new apiError_1.default({
                name: 'ValidationError',
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: 'uuid_ranch is required'
            });
        }
        const deleted = await this.ranchRepository.delete(uuid_ranch, tenantContext);
        if (!deleted) {
            throw new apiError_1.default({
                name: 'NotFound',
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
                description: 'Ranch not found or already inactive'
            });
        }
        await models_1.RanchCompanyRouteModel.destroy({ where: { uuid_ranch } });
        return {
            success: true,
            data: null
        };
    }
    async listActivePaddocks(params) {
        const gate = await this.getById({
            id: params.uuid_ranch,
            includeInactive: false,
            uuid_company: params.uuid_company,
            uuid_ranch_in: params.uuid_ranch_in,
        });
        if (!gate.success || !gate.data) {
            throw new apiError_1.default({
                name: 'NotFound',
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
                description: 'Ranch not found'
            });
        }
        const rows = await this.paddockRepository.findActiveByRanch(params.uuid_ranch);
        return {
            success: true,
            data: rows.map((row) => ({
                paddock_uuid: row.paddock_uuid,
                name: row.name,
                size_in_hectares: row.size_in_hectares ?? null,
                grass_type: row.grass_type ?? null,
                water_source: row.water_source ?? null,
                maximum_capacity: row.maximum_capacity ?? null,
            })),
        };
    }
}
exports.default = RanchService;
