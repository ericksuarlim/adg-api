import ApiError from '../errors/apiError';
import httpStatusCodes from '../errors/httpStatusCodes';
import { Model } from 'sequelize';

type GeneralData = {
    uuid_general?: number;
    body?: any;
};

class GeneralService {
    private generalModel: typeof Model;

    constructor(GeneralModel: typeof Model) {
        this.generalModel = GeneralModel;
    }

    async getAll(params: { page: number; size: number; sortBy: string; order: string }) {
        const { page, size, sortBy, order } = params;

        const offset = (page - 1) * size;
        const limit = size;

        const result = await this.generalModel.findAndCountAll({
            offset,
            limit,
            order: [[sortBy, order]],
        });

        const totalPages = Math.ceil(result.count / size);

        return {
            success: true,
            data: result.rows,
            pagination: {
                totalItems: result.count,
                totalPages,
                currentPage: page,
            }
        };
    }

    async createGeneral(data: GeneralData) {
        if (!data.body) {
            throw new ApiError({
                name: 'BAD_REQUEST',
                statusCode: httpStatusCodes.BAD_REQUEST,
                description: 'Request body is required',
                isOperational: true,
            });
        }
        return await this.generalModel.create(data.body);
    }

    async getGeneral(data: GeneralData) {
        if (!data.uuid_general) {
            throw new ApiError({
                name: 'BAD_REQUEST',
                statusCode: httpStatusCodes.BAD_REQUEST,
                description: 'UUID general is required',
                isOperational: true,
            });
        }

        const general = await this.generalModel.findByPk(data.uuid_general);
        if (!general) {
            throw new ApiError({
                name: 'NOT_FOUND',
                statusCode: httpStatusCodes.NOT_FOUND,
                description: 'General not found',
                isOperational: true,
            });
        }

        return general;
    }

    async deleteGeneral(data: GeneralData) {
        if (!data.uuid_general) {
            throw new ApiError({
                name: 'BAD_REQUEST',
                statusCode: httpStatusCodes.BAD_REQUEST,
                description: 'UUID general is required',
                isOperational: true,
            });
        }

        const general = await this.generalModel.findByPk(data.uuid_general);
        if (!general) {
            throw new ApiError({
                name: 'NOT_FOUND',
                statusCode: httpStatusCodes.NOT_FOUND,
                description: 'General not found',
                isOperational: true,
            });
        }

        await general.destroy();
        return true;
    }

    async updateGeneral(data: GeneralData) {
        if (!data.uuid_general || !data.body) {
            throw new ApiError({
                name: 'BAD_REQUEST',
                statusCode: httpStatusCodes.BAD_REQUEST,
                description: 'UUID general and body data are required',
                isOperational: true,
            });
        }

        const [affectedCount, updatedRows] = await this.generalModel.update(data.body, {
            where: { uuid_general: data.uuid_general },
            returning: true,
            plain: true,
        });

        if (affectedCount === 0 || !updatedRows) {
            throw new ApiError({
                name: 'NOT_FOUND',
                statusCode: httpStatusCodes.NOT_FOUND,
                description: 'General not found to update',
                isOperational: true,
            });
        }

        return updatedRows;
    }
}

export default GeneralService;
