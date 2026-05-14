import { Request, Response, NextFunction } from "express";
import { AnimalAttributes, AnimalCreationAttributes } from "../interfaces/animal/animal.interface";
import { handleResponse } from "../utils/response.handler";
import { buildGetAllParams, buildGetByIdParams } from "../utils/query.builder";
import { IBaseServiceInterface } from "../interfaces/services/base-service.interface";
import { IncludeInactiveQuery } from "../interfaces/params/query.interface";
import { IDeleteAnimalParams, IGetAnimalParams, IUpdateAnimalParams } from "../interfaces/params/animalParams.interface";
import { AuthRequest } from "../interfaces/middleware/auth-middleware.interface";
import { UserRole } from "../interfaces/roles/roles.interface";
import { assertRanchTokenAccess, ranchFilterFromUser } from "../helpers/access-scope.helper";
import ApiError from "../errors/apiError";
import HttpStatusCodes from "../errors/httpStatusCodes";

class AnimalController {
    private readonly animalService: IBaseServiceInterface<AnimalAttributes, AnimalCreationAttributes>;

    constructor(animalService: IBaseServiceInterface<AnimalAttributes, AnimalCreationAttributes>) {
        this.animalService = animalService;
    }

    private isSaasOwner(req: AuthRequest): boolean {
        return (req.user?.roles ?? []).includes(UserRole.SAAS_OWNER);
    }

    private animalTenant(req: AuthRequest): { uuid_company?: string; uuid_ranch_in?: string[] } {
        const ranchFilter = ranchFilterFromUser(req.user);
        return {
            uuid_company: this.isSaasOwner(req) ? undefined : req.user?.uuid_company,
            uuid_ranch_in: ranchFilter?.length ? ranchFilter : undefined,
        };
    }

    createAnimal = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const animalBody = req.body as AnimalCreationAttributes;
            if (this.isSaasOwner(req)) {
                if (!animalBody.uuid_company?.trim()) {
                    throw new ApiError({
                        name: "ValidationError",
                        statusCode: HttpStatusCodes.BAD_REQUEST,
                        description: "uuid_company is required in body when creating animals as SaaS owner",
                    });
                }
            } else {
                animalBody.uuid_company = req.user?.uuid_company as string;
            }

            if (animalBody.ranch_uuid) {
                assertRanchTokenAccess(req.user, animalBody.ranch_uuid);
            }

            const response = await this.animalService.create(animalBody);

            if (!response.success) {
                return res.status(response.code ?? 500).json(response);
            }

            return handleResponse(res, response, 201);
        } catch (error) {
            next(error);
        }
    };

    getAnimal = async (
        req: AuthRequest & Request<IGetAnimalParams, {}, {}, IncludeInactiveQuery>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { uuid_animal } = req.params;
            const { includeInactive } = buildGetByIdParams(req.query);
            const tenant = this.animalTenant(req);

            const response = await this.animalService.getById({
                id: uuid_animal,
                includeInactive,
                uuid_company: tenant.uuid_company,
                uuid_ranch_in: tenant.uuid_ranch_in,
            });

            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    };

    getAnimals = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const params = buildGetAllParams(req.query);
            const requestedCompany = typeof req.query.uuid_company === "string" ? req.query.uuid_company : undefined;
            params.uuid_company = this.isSaasOwner(req) ? requestedCompany : req.user?.uuid_company;
            const ranchFilter = ranchFilterFromUser(req.user);
            if (ranchFilter?.length) {
                params.uuid_ranch_in = ranchFilter;
            }

            const response = await this.animalService.getAll(params);
            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    };

    updateAnimal = async (req: AuthRequest & Request<IUpdateAnimalParams>, res: Response, next: NextFunction) => {
        try {
            const { uuid_animal } = req.params;
            const animalBody = req.body as AnimalCreationAttributes;
            const tenant = this.animalTenant(req);

            if (!this.isSaasOwner(req)) {
                animalBody.uuid_company = req.user?.uuid_company as string;
            }

            const existing = await this.animalService.getById({
                id: uuid_animal,
                includeInactive: false,
                uuid_company: tenant.uuid_company,
                uuid_ranch_in: tenant.uuid_ranch_in,
            });
            assertRanchTokenAccess(req.user, existing.data!.ranch_uuid);

            const response = await this.animalService.update(uuid_animal, animalBody, tenant);
            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    };

    deleteAnimal = async (req: AuthRequest & Request<IDeleteAnimalParams>, res: Response, next: NextFunction) => {
        try {
            const { uuid_animal } = req.params;
            const tenant = this.animalTenant(req);

            const existing = await this.animalService.getById({
                id: uuid_animal,
                includeInactive: false,
                uuid_company: tenant.uuid_company,
                uuid_ranch_in: tenant.uuid_ranch_in,
            });
            assertRanchTokenAccess(req.user, existing.data!.ranch_uuid);

            const response = await this.animalService.delete(uuid_animal, {
                uuid_company: tenant.uuid_company,
                uuid_ranch_in: tenant.uuid_ranch_in,
            });
            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    };
}

export default AnimalController;
