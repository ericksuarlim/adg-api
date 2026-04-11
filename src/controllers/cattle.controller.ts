import { Request, Response, NextFunction } from 'express';
import { CattleAttributes, CattleCreationAttributes } from "../interfaces/cattle/cattle.interface";
import { handleResponse } from '../utils/response.handler';
import { buildGetAllParams, buildGetByIdParams } from '../utils/query.builder';
import { IBaseServiceInterface } from '../interfaces/services/base-service.interface';
import { IncludeInactiveQuery } from '../interfaces/params/query.interface';
import { IDeleteCattleParams, IGetCattleParams, IUpdateCattleParams } from '../interfaces/params/cattleParams.interface';

class CattleController {
    private cattleService: IBaseServiceInterface<CattleAttributes, CattleCreationAttributes>;

    constructor(cattleService: IBaseServiceInterface<CattleAttributes, CattleCreationAttributes>) {
        this.cattleService = cattleService;
    }

    createCattle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const cattleBody = req.body as CattleCreationAttributes;
            const response = await this.cattleService.create(cattleBody);

            if (!response.success) {
                return res.status(response.code ?? 500).json(response);
            }

            return handleResponse(res, response, 201);
        } catch (error) {
            next(error);
        }
    }

    getCattle = async (
        req: Request<IGetCattleParams, {}, {}, IncludeInactiveQuery>,
        res: Response, next: NextFunction) => 
    {
        try {
            const { uuid_cattle } = req.params;
            const { includeInactive } = buildGetByIdParams(req.query);

            const response = await this.cattleService.getById({id: uuid_cattle, includeInactive});

            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    }

    getCattles = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const params = buildGetAllParams(req.query);

            const response = await this.cattleService.getAll(params);

            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    }

    updateCattle = async (req: Request<IUpdateCattleParams>, res: Response, next: NextFunction) => {
        try {
            const { uuid_cattle } = req.params;
            const cattleBody = req.body as CattleCreationAttributes;
            const response = await this.cattleService.update(uuid_cattle, cattleBody);

            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    }

    deleteCattle = async (req: Request<IDeleteCattleParams>, res: Response, next: NextFunction) => {
        try {
            const { uuid_cattle } = req.params;
            const response = await this.cattleService.delete(uuid_cattle);

            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    }
}

export default CattleController;
