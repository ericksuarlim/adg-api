import { ServiceResponse } from "../interfaces/common/service-response.interface";
import { CattleAttributes, CattleCreationAttributes } from "../interfaces/cattle/cattle.interface";
import {
    ICreateService, IDeleteService,
    IGetAllService,
    IGetService,
    IUpdateService
} from "../interfaces/services/base-service.interface";

class CattleService implements
    IGetAllService<CattleAttributes>,
    IGetService<CattleAttributes>,
    ICreateService<CattleAttributes, CattleCreationAttributes>,
    IUpdateService<CattleAttributes, CattleCreationAttributes>,
    IDeleteService {
    private cattleModel: any;

    constructor(CattleModel: any) {
        this.cattleModel = CattleModel;
    }

    async getAll(
        params: { page: number; size: number; sortBy: string; order: 'ASC' | 'DESC' }
    ): Promise<ServiceResponse<CattleAttributes[]>> {
        const { page, size, sortBy, order } = params;

        const offset = (page - 1) * size;
        const limit = size;

        const result = await this.cattleModel.findAndCountAll({
            offset,
            limit,
            order: [[sortBy, order]],
        });

        const totalPages = Math.ceil(result.count / size);

        const plainRows: CattleAttributes[] = result.rows.map((cattle: any) =>
            cattle.toJSON?.() ?? cattle
        );

        return {
            success: true,
            data: plainRows,
            pagination: {
                totalItems: result.count,
                totalPages,
                currentPage: page,
            },
        } as ServiceResponse<CattleAttributes[]>;
    }

    async create(cattleBody: CattleCreationAttributes): Promise<ServiceResponse<CattleAttributes>> {
        const cattle = await this.cattleModel.create(cattleBody);

        return { success: true, data: cattle };
    }

    async getById(uuid_cattle: string): Promise<ServiceResponse<CattleAttributes | null>>  {
        const cattle = await this.cattleModel.findByPk(uuid_cattle);
        if (!cattle) return { success: false, error: 'Cattle not found', code: 404 };

        return { success: true, data: cattle };
    }

    async delete(uuid_cattle: string): Promise<ServiceResponse<null>> {
        const cattle = await this.cattleModel.findByPk(uuid_cattle);
        if (!cattle) return { success: false, error: 'User not found', code: 404 };

        await cattle.destroy();

        return { success: true, data: null };
    }

    async update(uuid_cattle: string, cattleBody: CattleCreationAttributes): Promise<ServiceResponse<CattleAttributes | null>> {
        const [count, updatedCattle] = await this.cattleModel.update(cattleBody, {
            where: { uuid_cattle },
            returning: true,
            plain: true,
        });

        if (count === 0) return { success: false, error: 'Cattle not found', code: 404 };

        return { success: true, data: updatedCattle };
    }
}

export default CattleService;
