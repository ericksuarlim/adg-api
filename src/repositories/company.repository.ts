import {CompanyCreationAttributes} from "../interfaces/company/company.interface";
import {CompanyModel} from "../database/models";
import {IBaseRepository} from "../interfaces/repositories/base-repository.interface";
import {IBaseParams} from "../interfaces/params/query.interface";

class CompanyRepository implements
    IBaseRepository<CompanyModel, CompanyCreationAttributes> {

    async findAll(
        params: IBaseParams
    ): Promise<{rows: CompanyModel[], count: number}> {

        const { page, size, sortBy, order, status } = params;

        const offset = (page - 1) * size;

        const where: any = {};

        if (status === 'active') {
            where.is_active = true;
        } else if (status === 'inactive') {
            where.is_active = false;
        }
        if (params.uuid_company) {
            where.uuid_company = params.uuid_company;
        }

        return await CompanyModel.findAndCountAll({
            where,
            offset,
            limit: size,
            order: [[sortBy, order]],
        });
    }

    async findById(params: { id: string, includeInactive?: boolean, uuid_company?: string }): Promise<CompanyModel | null> {
        const { id, includeInactive, uuid_company } = params;
        const where: any = { uuid_company: id };

        if (!includeInactive) {
            where.is_active = true;
        }
        if (uuid_company) {
            where.uuid_company = uuid_company;
        }

        return await CompanyModel.findOne({ where });
    }

    async create(data: CompanyCreationAttributes): Promise<CompanyModel> {
        return await CompanyModel.create(data);
    }

    async update(uuid_company: string, data: CompanyCreationAttributes, options?: { uuid_company?: string }): Promise<CompanyModel | null> {
        const where: any = { uuid_company, is_active: true };
        if (options?.uuid_company) {
            where.uuid_company = options.uuid_company;
        }

        const [count, updated] = await CompanyModel.update(data, {
            where,
            returning: true,
        });

        if (count === 0) return null;

        return updated[0];
    }

    async delete(uuid_company: string, options?: { uuid_company?: string }): Promise<boolean> {
        const where: any = { uuid_company, is_active: true };
        if (options?.uuid_company) {
            where.uuid_company = options.uuid_company;
        }

        const [count] = await CompanyModel.update(
            { is_active: false },
            { where }
        );

        return count > 0;
    }
}

export default CompanyRepository;