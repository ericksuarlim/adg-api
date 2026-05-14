"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const reference_sample_model_1 = __importDefault(require("../database/models/reference-sample.model"));
class ReferenceSampleRepository {
    async findAll(params) {
        const { page, size, sortBy, order, status, uuid_company } = params;
        const offset = (page - 1) * size;
        const where = {};
        if (status === 'active') {
            where.is_active = true;
        }
        else if (status === 'inactive') {
            where.is_active = false;
        }
        if (uuid_company) {
            where.uuid_company = uuid_company;
        }
        return reference_sample_model_1.default.findAndCountAll({
            where,
            offset,
            limit: size,
            order: [[sortBy, order]],
        });
    }
    async findById(params) {
        const { id, includeInactive, uuid_company } = params;
        const where = {
            uuid_reference_sample: id,
        };
        if (!includeInactive) {
            where.is_active = true;
        }
        if (uuid_company) {
            where.uuid_company = uuid_company;
        }
        return reference_sample_model_1.default.findOne({ where });
    }
    async create(data) {
        return reference_sample_model_1.default.create(data);
    }
    async update(uuid_reference_sample, data, options) {
        const where = {
            uuid_reference_sample,
            is_active: true,
        };
        if (options?.uuid_company) {
            where.uuid_company = options.uuid_company;
        }
        const [count, updated] = await reference_sample_model_1.default.update(data, {
            where,
            returning: true,
        });
        if (count === 0)
            return null;
        return updated[0];
    }
    async delete(uuid_reference_sample, options) {
        const where = {
            uuid_reference_sample,
            is_active: true,
        };
        if (options?.uuid_company) {
            where.uuid_company = options.uuid_company;
        }
        const [count] = await reference_sample_model_1.default.update({ is_active: false }, { where });
        return count > 0;
    }
}
exports.default = ReferenceSampleRepository;
