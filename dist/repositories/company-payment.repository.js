"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const company_payment_model_1 = __importDefault(require("../database/models/company-payment.model"));
class CompanyPaymentRepository {
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
        return company_payment_model_1.default.findAndCountAll({
            where,
            offset,
            limit: size,
            order: [[sortBy, order]]
        });
    }
    async findById(params) {
        const { id, includeInactive, uuid_company } = params;
        const where = {
            uuid_company_payment: id,
        };
        if (!includeInactive) {
            where.is_active = true;
        }
        if (uuid_company) {
            where.uuid_company = uuid_company;
        }
        return company_payment_model_1.default.findOne({ where });
    }
    async create(data) {
        return company_payment_model_1.default.create(data);
    }
    async update(id, data, options) {
        const where = {
            uuid_company_payment: id,
            is_active: true
        };
        if (options?.uuid_company) {
            where.uuid_company = options.uuid_company;
        }
        const [count, updated] = await company_payment_model_1.default.update(data, {
            where,
            returning: true
        });
        if (count === 0) {
            return null;
        }
        return updated[0];
    }
    async delete(id, options) {
        const where = {
            uuid_company_payment: id,
            is_active: true
        };
        if (options?.uuid_company) {
            where.uuid_company = options.uuid_company;
        }
        const [count] = await company_payment_model_1.default.update({ is_active: false }, { where });
        return count > 0;
    }
}
exports.default = CompanyPaymentRepository;
