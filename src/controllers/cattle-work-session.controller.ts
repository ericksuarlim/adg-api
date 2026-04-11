import { Request, Response, NextFunction } from 'express';
import {CattleWorkSessionAttributes, CattleWorkSessionCreationAttributes} from "../interfaces/work-session/cattle-work-session.interface";
import { buildGetAllParams, buildGetByIdParams } from '../utils/query.builder';
import { handleResponse } from '../utils/response.handler';
import { IBaseServiceInterface } from '../interfaces/services/base-service.interface';
import { IncludeInactiveQuery } from '../interfaces/params/query.interface';
import { IDeleteCattleWorkSessionParams, IGetCattleWorkSessionParams, IUpdateCattleWorkSessionParams } from '../interfaces/params/cattleWorkSession.interface';

class CattleWorkSessionController {
    private cattleWorkSessionService: IBaseServiceInterface<CattleWorkSessionAttributes, CattleWorkSessionCreationAttributes>;

    constructor(cattleWorkSessionService: IBaseServiceInterface<CattleWorkSessionAttributes, CattleWorkSessionCreationAttributes>) {
        this.cattleWorkSessionService = cattleWorkSessionService;
    }

    getCattleWorkSessions = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const params = buildGetAllParams(req.query);

            const response = await this.cattleWorkSessionService.getAll(params);

            return handleResponse(res, response);
        } catch (err) {
            next(err);
        }
    }

    getCattleWorkSession = async (
        req: Request<IGetCattleWorkSessionParams, {}, {}, IncludeInactiveQuery>,
        res: Response, next: NextFunction) => 
    {
        try {
            const { id_cattle_work } = req.params;
            const { includeInactive } = buildGetByIdParams(req.query);

            const response = await this.cattleWorkSessionService.getById({id: id_cattle_work, includeInactive});

            return handleResponse(res, response);
        } catch (err) {
            next(err);
        }
    }

    createCattleWorkSession = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const body = req.body as CattleWorkSessionCreationAttributes;
            const response = await this.cattleWorkSessionService.create(body);

            return handleResponse(res, response, 201);
        } catch (err) {
            next(err);
        }
    }

    updateCattleWorkSession = async (req: Request<IUpdateCattleWorkSessionParams>, res: Response, next: NextFunction) => {
        try {
            const { id_cattle_work } = req.params;
            const response = await this.cattleWorkSessionService.update(id_cattle_work, req.body);

            return handleResponse(res, response);
        } catch (err) {
            next(err);
        }
    }

    deleteCattleWorkSession = async (req: Request<IDeleteCattleWorkSessionParams>, res: Response, next: NextFunction) => {
        try {
            const { id_cattle_work } = req.params;
            const response = await this.cattleWorkSessionService.delete(id_cattle_work);

            return handleResponse(res, response);
        } catch (err) {
            next(err);
        }
    }
}

export default CattleWorkSessionController;
