import { Request, Response, NextFunction } from "express";
import { RanchAttributes, RanchCreationAttributes } from "../interfaces/ranch/ranch.interface";
import { handleResponse } from "../utils/response.handler";
import { buildGetAllParams, buildGetByIdParams } from "../utils/query.builder";
import { IDeleteRanchParams, IGetRanchParams, IUpdateRanchParams } from "../interfaces/params/ranchParams.interface";
import { IncludeInactiveQuery } from "../interfaces/params/query.interface";
import { AuthRequest } from "../interfaces/middleware/auth-middleware.interface";
import { UserRole } from "../interfaces/roles/roles.interface";
import {
    assertRanchTokenAccess,
    ranchFilterFromUser,
    resolveAccessScope,
} from "../helpers/access-scope.helper";
import ApiError from "../errors/apiError";
import HttpStatusCodes from "../errors/httpStatusCodes";
import RanchService from "../services/ranch.service";

class RanchController {
    private readonly ranchService: RanchService;

    constructor(ranchService: RanchService) {
        this.ranchService = ranchService;
    }

    private isSaasOwner(req: AuthRequest): boolean {
        return (req.user?.roles ?? []).includes(UserRole.SAAS_OWNER);
    }

    createRanch = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            if (resolveAccessScope(req.user) !== "company_all_ranches" && !this.isSaasOwner(req)) {
                throw new ApiError({
                    name: "Forbidden",
                    statusCode: HttpStatusCodes.FORBIDDEN,
                    description: "Only company administrators or SaaS owners can create ranches",
                });
            }
            const reqBody = req.body as RanchCreationAttributes;
            if (this.isSaasOwner(req)) {
                if (!reqBody.uuid_company?.trim()) {
                    throw new ApiError({
                        name: "ValidationError",
                        statusCode: HttpStatusCodes.BAD_REQUEST,
                        description: "uuid_company is required to create a ranch as SaaS owner",
                    });
                }
            } else {
                reqBody.uuid_company = req.user?.uuid_company as string;
            }

            const response = await this.ranchService.create(reqBody);

            if (!response.success) {
                return res.status(response.code ?? 500).json(response);
            }

            const created = response.data;

            return handleResponse(res, response, 201);
        } catch (error) {
            next(error);
        }
    };

    getRanch = async (
        req: AuthRequest & Request<IGetRanchParams, {}, {}, IncludeInactiveQuery>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { uuid_ranch } = req.params;
            const { includeInactive } = buildGetByIdParams(req.query);

            assertRanchTokenAccess(req.user, uuid_ranch);

            const ranchFilter = ranchFilterFromUser(req.user);
            const response = await this.ranchService.getById({
                id: uuid_ranch,
                includeInactive,
                uuid_company: this.isSaasOwner(req) ? undefined : req.user?.uuid_company,
                uuid_ranch_in: ranchFilter,
            });

            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    };

    getRanchPaddocks = async (req: AuthRequest & Request<IGetRanchParams>, res: Response, next: NextFunction) => {
        try {
            const { uuid_ranch } = req.params;
            assertRanchTokenAccess(req.user, uuid_ranch);
            const ranchFilter = ranchFilterFromUser(req.user);
            const response = await this.ranchService.listActivePaddocks({
                uuid_ranch,
                uuid_company: this.isSaasOwner(req) ? undefined : req.user?.uuid_company,
                uuid_ranch_in: ranchFilter,
            });
            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    };

    getRanches = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const params = buildGetAllParams(req.query) as {
                page: number;
                size: number;
                sortBy: string;
                order: "ASC" | "DESC";
                status?: "all" | "active" | "inactive";
                uuid_company?: string;
                uuid_ranch_in?: string[];
            };
            const requestedCompany = typeof req.query.uuid_company === "string" ? req.query.uuid_company : undefined;
            params.uuid_company = this.isSaasOwner(req) ? requestedCompany : req.user?.uuid_company;
            const ranchFilter = ranchFilterFromUser(req.user);
            if (ranchFilter?.length) {
                (params as { uuid_ranch_in?: string[] }).uuid_ranch_in = ranchFilter;
            }

            const response = await this.ranchService.getAll(params);

            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    };

    updateRanch = async (req: AuthRequest & Request<IUpdateRanchParams>, res: Response, next: NextFunction) => {
        try {
            if (resolveAccessScope(req.user) !== "company_all_ranches" && !this.isSaasOwner(req)) {
                throw new ApiError({
                    name: "Forbidden",
                    statusCode: HttpStatusCodes.FORBIDDEN,
                    description: "Only company administrators or SaaS owners can modify ranches",
                });
            }
            const { uuid_ranch } = req.params;
            assertRanchTokenAccess(req.user, uuid_ranch);
            const reqBody = req.body as RanchCreationAttributes;
            if (!this.isSaasOwner(req)) {
                reqBody.uuid_company = req.user?.uuid_company as string;
            }

            const response = await this.ranchService.update(
                uuid_ranch,
                reqBody,
                this.isSaasOwner(req) ? undefined : { uuid_company: req.user?.uuid_company }
            );

            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    };

    deleteRanch = async (req: AuthRequest & Request<IDeleteRanchParams>, res: Response, next: NextFunction) => {
        try {
            if (resolveAccessScope(req.user) !== "company_all_ranches" && !this.isSaasOwner(req)) {
                throw new ApiError({
                    name: "Forbidden",
                    statusCode: HttpStatusCodes.FORBIDDEN,
                    description: "Only company administrators or SaaS owners can delete ranches",
                });
            }
            const { uuid_ranch } = req.params;
            assertRanchTokenAccess(req.user, uuid_ranch);

            const response = await this.ranchService.delete(
                uuid_ranch,
                this.isSaasOwner(req) ? undefined : { uuid_company: req.user?.uuid_company }
            );

            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    };
}

export default RanchController;
