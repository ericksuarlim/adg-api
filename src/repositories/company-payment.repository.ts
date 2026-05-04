import { IBaseParams } from "../interfaces/params/query.interface";
import CompanyPaymentModel from "../database/models/company-payment.model";
import { CompanyPaymentCreationAttributes } from "../interfaces/company/company-payment.interface";
import { IBaseRepository } from "../interfaces/repositories/base-repository.interface";

class CompanyPaymentRepository implements IBaseRepository<CompanyPaymentModel, CompanyPaymentCreationAttributes> {
    async findAll(params: IBaseParams): Promise<{ rows: CompanyPaymentModel[]; count: number }> {
        const { page, size, sortBy, order, status, uuid_company } = params;
        const offset = (page - 1) * size;

        const where: Record<string, unknown> = {};
        if (status === 'active') {
            where.is_active = true;
        } else if (status === 'inactive') {
            where.is_active = false;
        }

        if (uuid_company) {
            where.uuid_company = uuid_company;
        }

        return CompanyPaymentModel.findAndCountAll({
            where,
            offset,
            limit: size,
            order: [[sortBy, order]]
        });
    }

    async findById(params: { id: string; includeInactive?: boolean; uuid_company?: string }): Promise<CompanyPaymentModel | null> {
        const { id, includeInactive, uuid_company } = params;
        const where: Record<string, unknown> = {
            uuid_company_payment: id,
        };

        if (!includeInactive) {
            where.is_active = true;
        }
        if (uuid_company) {
            where.uuid_company = uuid_company;
        }

        return CompanyPaymentModel.findOne({ where });
    }

    async create(data: CompanyPaymentCreationAttributes): Promise<CompanyPaymentModel> {
        return CompanyPaymentModel.create(data);
    }

    async update(
        id: string,
        data: CompanyPaymentCreationAttributes,
        options?: { uuid_company?: string }
    ): Promise<CompanyPaymentModel | null> {
        const where: Record<string, unknown> = {
            uuid_company_payment: id,
            is_active: true
        };

        if (options?.uuid_company) {
            where.uuid_company = options.uuid_company;
        }

        const [count, updated] = await CompanyPaymentModel.update(data, {
            where,
            returning: true
        });

        if (count === 0) {
            return null;
        }

        return updated[0];
    }

    async delete(id: string, options?: { uuid_company?: string }): Promise<boolean> {
        const where: Record<string, unknown> = {
            uuid_company_payment: id,
            is_active: true
        };
        if (options?.uuid_company) {
            where.uuid_company = options.uuid_company;
        }

        const [count] = await CompanyPaymentModel.update({ is_active: false }, { where });
        return count > 0;
    }
}

export default CompanyPaymentRepository;
