import { Request, Response, NextFunction } from "express";
import { handleResponse } from "../utils/response.handler";
import { AuthRequest } from "../interfaces/middleware/auth-middleware.interface";
import { OwnerCreationAttributes } from "../interfaces/owner/owner.interface";
import {
    IDeleteOwnerParams,
    IGetOwnerParams,
    IUpdateOwnerParams,
} from "../interfaces/params/ownerParams.interface";
import { buildGetAllParams } from "../utils/query.builder";
import OwnerService from "../services/owner.service";

class OwnerController {
    constructor(private readonly ownerService: OwnerService) {}

    listOwners = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const params = buildGetAllParams(req.query);
            params.sortBy = params.sortBy === "createdAt" ? "full_name" : params.sortBy;
            params.status = "active";

            const usePaginated =
                req.query.page !== undefined ||
                req.query.size !== undefined ||
                req.query.search !== undefined;

            if (usePaginated) {
                const response = await this.ownerService.listPaginated(params);
                return handleResponse(res, response);
            }

            const response = await this.ownerService.listActive();
            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    };

    getById = async (
        req: AuthRequest & Request<IGetOwnerParams>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { owner_uuid } = req.params;
            const response = await this.ownerService.getById(owner_uuid);
            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    };

    create = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const body = req.body as OwnerCreationAttributes;
            const response = await this.ownerService.create(body);
            return handleResponse(res, response, 201);
        } catch (error) {
            next(error);
        }
    };

    update = async (
        req: AuthRequest & Request<IUpdateOwnerParams>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { owner_uuid } = req.params;
            const body = req.body as Partial<OwnerCreationAttributes>;
            const response = await this.ownerService.update(owner_uuid, body);
            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    };

    delete = async (
        req: AuthRequest & Request<IDeleteOwnerParams>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { owner_uuid } = req.params;
            const response = await this.ownerService.delete(owner_uuid);
            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    };
}

export default OwnerController;
