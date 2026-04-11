import {CompanyCreationAttributes} from "../interfaces/company/company.interface";
import {CompanyModel} from "../database/models";
import {IBaseRepository} from "../interfaces/repositories/base-repository.interface";
import {Order, Status} from "../interfaces/params/query.interface";

class CompanyRepository implements
    IBaseRepository<CompanyModel, CompanyCreationAttributes> {

    async findAll(
        params: {
        page: number;
        size: number;
        sortBy: string;
        order: Order;
        status?: Status;
        }
    ): Promise<{rows: CompanyModel[], count: number}> {

        const { page, size, sortBy, order, status } = params;

        const offset = (page - 1) * size;

        const where: any = {};

        if (status === 'active') {
            where.is_active = true;
        } else if (status === 'inactive') {
            where.is_active = false;
        }

        return await CompanyModel.findAndCountAll({
            where,
            offset,
            limit: size,
            order: [[sortBy, order]],
        });
    }

    async findById(params: { id: string, includeInactive?: boolean }): Promise<CompanyModel | null> {
        const { id, includeInactive } = params;
        const where: any = { uuid_company: id };

        if (includeInactive !== undefined) {
            where.is_active = includeInactive;
        }

        return await CompanyModel.findOne({ where });
    }

    async create(data: CompanyCreationAttributes): Promise<CompanyModel> {
        return await CompanyModel.create(data);
    }

    async update(uuid_company: string, data: CompanyCreationAttributes): Promise<CompanyModel | null> {
        const [count, updated] = await CompanyModel.update(data, {
            where: { uuid_company, is_active: true },
            returning: true,
        });

        if (count === 0) return null;

        return updated[0];
    }

    async delete(uuid_company: string): Promise<boolean> {
        const [count] = await CompanyModel.update(
            { is_active: false },
            { where: { uuid_company, is_active: true } }
        );

        return count > 0;
    }
}

export default CompanyRepository;