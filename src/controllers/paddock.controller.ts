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
import { buildGetAllParams } from "../utils/query.builder";
import { PaddockListParams } from "../repositories/paddock.repository";

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
            const baseParams = buildGetAllParams(req.query) as PaddockListParams;
            baseParams.sortBy = baseParams.sortBy === "createdAt" ? "name" : baseParams.sortBy;
            baseParams.status = "active";

            const ranch_uuid =
                typeof req.query.ranch_uuid === "string" ? req.query.ranch_uuid.trim() : "";
            if (ranch_uuid) {
                assertRanchTokenAccess(req.user, ranch_uuid);
                baseParams.ranch_uuid = ranch_uuid;
            }

            const uuidCompany =
                typeof req.query.uuid_company === "string" ? req.query.uuid_company.trim() : "";
            if (uuidCompany) {
                baseParams.uuid_company = uuidCompany;
            }

            const ranchInRaw = typeof req.query.uuid_ranch_in === "string" ? req.query.uuid_ranch_in : "";
            if (ranchInRaw) {
                baseParams.uuid_ranch_in = ranchInRaw.split(",").map((v) => v.trim()).filter(Boolean);
            }

            const ranchFilter = ranchFilterFromUser(req.user);
            if (ranchFilter?.length && !baseParams.ranch_uuid) {
                baseParams.uuid_ranch_in = baseParams.uuid_ranch_in?.length
                    ? baseParams.uuid_ranch_in.filter((id) => ranchFilter.includes(id))
                    : ranchFilter;
            }

            if (!this.isSaasOwner(req) && !baseParams.uuid_company) {
                baseParams.uuid_company = req.user?.uuid_company;
            }

            const usePaginated =
                req.query.page !== undefined ||
                req.query.size !== undefined ||
                req.query.search !== undefined ||
                baseParams.uuid_company ||
                (baseParams.uuid_ranch_in?.length ?? 0) > 0;

            if (usePaginated) {
                const response = await this.paddockService.listPaginated(
                    baseParams,
                    this.accessContext(req)
                );
                return handleResponse(res, response);
            }

            if (!ranch_uuid) {
                throw new ApiError({
                    name: "ValidationError",
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    description: "ranch_uuid query parameter is required",
                });
            }

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
