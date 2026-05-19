import { Request, Response, NextFunction } from "express";
import { handleResponse } from "../utils/response.handler";
import { AuthRequest } from "../interfaces/middleware/auth-middleware.interface";
import { UserRole } from "../interfaces/roles/roles.interface";
import { assertRanchTokenAccess, ranchFilterFromUser } from "../helpers/access-scope.helper";
import ApiError from "../errors/apiError";
import HttpStatusCodes from "../errors/httpStatusCodes";
import { PaddockCreationAttributes } from "../interfaces/paddock/paddock.interface";
import {
    IDeletePaddockParams,
    IGetPaddockParams,
    IUpdatePaddockParams,
} from "../interfaces/params/paddockParams.interface";
import PaddockService from "../services/paddock.service";

class PaddockController {
    constructor(private readonly paddockService: PaddockService) {}

    private isSaasOwner(req: AuthRequest): boolean {
        return (req.user?.roles ?? []).includes(UserRole.SAAS_OWNER);
    }

    private accessContext(req: AuthRequest) {
        return {
            uuid_company: this.isSaasOwner(req) ? undefined : req.user?.uuid_company,
            uuid_ranch_in: ranchFilterFromUser(req.user),
        };
    }

    listByRanch = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const ranch_uuid =
                typeof req.query.ranch_uuid === "string" ? req.query.ranch_uuid.trim() : "";
            if (!ranch_uuid) {
                throw new ApiError({
                    name: "ValidationError",
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    description: "ranch_uuid query parameter is required",
                });
            }
            assertRanchTokenAccess(req.user, ranch_uuid);
            const response = await this.paddockService.listByRanch(ranch_uuid, this.accessContext(req));
            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    };

    getById = async (
        req: AuthRequest & Request<IGetPaddockParams>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { paddock_uuid } = req.params;
            const response = await this.paddockService.getById(paddock_uuid, this.accessContext(req));
            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    };

    create = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const body = req.body as PaddockCreationAttributes;
            if (body.ranch_uuid) {
                assertRanchTokenAccess(req.user, body.ranch_uuid);
            }
            const response = await this.paddockService.create(body, this.accessContext(req));
            return handleResponse(res, response, 201);
        } catch (error) {
            next(error);
        }
    };

    update = async (
        req: AuthRequest & Request<IUpdatePaddockParams>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { paddock_uuid } = req.params;
            const body = req.body as Partial<PaddockCreationAttributes>;
            const response = await this.paddockService.update(paddock_uuid, body, this.accessContext(req));
            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    };

    delete = async (
        req: AuthRequest & Request<IDeletePaddockParams>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { paddock_uuid } = req.params;
            const response = await this.paddockService.delete(paddock_uuid, this.accessContext(req));
            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    };
}

export default PaddockController;
