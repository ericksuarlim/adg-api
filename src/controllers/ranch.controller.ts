import { Request, Response, NextFunction } from "express";
import { RanchAttributes, RanchCreationAttributes } from "../interfaces/ranch/ranch.interface";
import { IBaseServiceInterface } from "../interfaces/services/base-service.interface";
import { handleResponse } from "../utils/response.handler";
import { buildGetAllParams, buildGetByIdParams } from "../utils/query.builder";
import { IDeleteRanchParams, IGetRanchParams, IUpdateRanchParams } from "../interfaces/params/ranchParams.interface";
import { IncludeInactiveQuery } from "../interfaces/params/query.interface";
import { AuthRequest } from "../interfaces/middleware/auth-middleware.interface";

class RanchController {
    private readonly ranchService: IBaseServiceInterface<RanchAttributes, RanchCreationAttributes>;

    constructor(ranchService: IBaseServiceInterface<RanchAttributes, RanchCreationAttributes>) {
        this.ranchService = ranchService;
    }

    createRanch = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const reqBody = req.body as RanchCreationAttributes;
            reqBody.uuid_company = req.user?.uuid_company as string;

            const response = await this.ranchService.create(reqBody);

            if (!response.success) {
                return res.status(response.code ?? 500).json(response);
            }

            return handleResponse(res, response, 201);
        } catch (error) {
            next(error);
        }
    }

    getRanch = async (
        req: AuthRequest & Request<IGetRanchParams, {}, {}, IncludeInactiveQuery>,
        res: Response,
         next: NextFunction
    ) => {
        try {
            const { uuid_ranch } = req.params;
            const { includeInactive } = buildGetByIdParams(req.query);

            const response = await this.ranchService.getById({
                id: uuid_ranch,
                includeInactive,
                uuid_company: req.user?.uuid_company
            });

            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    }

    getRanches = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const params = buildGetAllParams(req.query);
            params.uuid_company = req.user?.uuid_company;

            const response = await this.ranchService.getAll(params);

            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    }

    updateRanch = async (req: AuthRequest & Request<IUpdateRanchParams>, res: Response, next: NextFunction) => {
        try {
            const { uuid_ranch } = req.params;
            const reqBody = req.body as RanchCreationAttributes;
            reqBody.uuid_company = req.user?.uuid_company as string;

            const response = await this.ranchService.update(uuid_ranch, reqBody, { uuid_company: req.user?.uuid_company });

            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    }

    deleteRanch = async (req: AuthRequest & Request<IDeleteRanchParams>, res: Response, next: NextFunction) => {
        try {
            const { uuid_ranch } = req.params;

            const response = await this.ranchService.delete(uuid_ranch, { uuid_company: req.user?.uuid_company });

            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    }
}

export default RanchController;