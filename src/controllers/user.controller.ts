import { Request, Response, NextFunction } from 'express';
import {UserAttributes, UserCreationAttributes} from "../interfaces/user/user.interface";
import {IBaseServiceInterface} from "../interfaces/services/base-service.interface";
import {IUserManagerServiceInterface} from "../interfaces/services/user-service.interface";
import {
    IDeleteUserParams,
    IGetUserParams,
    IManageUserParams,
    IUpdateUserParams
} from "../interfaces/params/userParams.interface";
import { handleResponse } from '../utils/response.handler';
import { buildGetAllParams, buildGetByIdParams } from '../utils/query.builder';
import { IBaseParams, IncludeInactiveQuery } from '../interfaces/params/query.interface';
import { AuthRequest } from "../interfaces/middleware/auth-middleware.interface";
import { UserRole } from "../interfaces/roles/roles.interface";
import ApiError from "../errors/apiError";
import HttpStatusCodes from "../errors/httpStatusCodes";

class UserController {
    private readonly userService: IBaseServiceInterface<UserAttributes, UserCreationAttributes>;
    private readonly userManagerService: IUserManagerServiceInterface<UserAttributes>;

    constructor(
        userService: IBaseServiceInterface<UserAttributes, UserCreationAttributes>,
        userManagerService: IUserManagerServiceInterface<UserAttributes>
    ) {
        this.userService = userService;
        this.userManagerService = userManagerService;
    }

    private isSaasOwner(req: AuthRequest): boolean {
        return (req.user?.roles ?? []).includes(UserRole.SAAS_OWNER);
    }

    createUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userBody = req.body as UserCreationAttributes;
            if (!this.isSaasOwner(req)) {
                userBody.uuid_company = req.user?.uuid_company as string;
            }
            const response = await this.userService.create(userBody);

            return handleResponse(res, response, 201);
        } catch (error) {
            next(error);
        }
    }

    getUser = async (        
        req: AuthRequest & Request<IGetUserParams, {}, {}, IncludeInactiveQuery>,
        res: Response, next: NextFunction
    ) => {
        try {
            const { uuid_user } = req.params;
            const { includeInactive } = buildGetByIdParams(req.query);

            const response = await this.userService.getById({
                id: uuid_user,
                includeInactive,
                uuid_company: this.isSaasOwner(req) ? undefined : req.user?.uuid_company
            });

            return handleResponse(res, response, 200);
        } catch (error) {
            next(error);
        }
    }

    getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const params = buildGetAllParams(req.query) as IBaseParams;
            const requestedCompany = typeof req.query.uuid_company === 'string'
                ? req.query.uuid_company
                : undefined;
            params.uuid_company = this.isSaasOwner(req)
                ? requestedCompany
                : req.user?.uuid_company;

            const response = await this.userService.getAll(params);

            return handleResponse(res, response, 200);
        } catch (error) {
            next(error);
        }
    }

    checkUserFieldAvailability = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const requestedCompany = typeof req.query.uuid_company === 'string'
                ? req.query.uuid_company
                : undefined;
            const uuid_company = this.isSaasOwner(req) && requestedCompany
                ? requestedCompany
                : (req.user?.uuid_company as string | undefined);

            if (!uuid_company) {
                throw new ApiError({
                    name: 'ValidationError',
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    description: 'Company context is required'
                });
            }

            const email = typeof req.query.email === 'string' ? req.query.email : undefined;
            const username = typeof req.query.username === 'string' ? req.query.username : undefined;
            const id_card = typeof req.query.id_card === 'string' ? req.query.id_card : undefined;
            const exclude_uuid_user = typeof req.query.exclude_uuid_user === 'string'
                ? req.query.exclude_uuid_user
                : undefined;

            const response = await this.userManagerService.checkUserFieldAvailability({
                email,
                username,
                id_card,
                uuid_company,
                exclude_uuid_user
            });

            return handleResponse(res, response, 200);
        } catch (error) {
            next(error);
        }
    }

    updateUser = async (req: AuthRequest & Request<IUpdateUserParams>, res: Response, next: NextFunction) => {
        try {
            const { uuid_user } = req.params;
            const userBody = req.body as UserCreationAttributes;
            const tenantScope = this.isSaasOwner(req) ? undefined : req.user?.uuid_company;
            if (!this.isSaasOwner(req)) {
                userBody.uuid_company = req.user?.uuid_company as string;
                delete (userBody as { password?: string }).password;
            }
            const response = await this.userService.update(uuid_user, userBody, { uuid_company: tenantScope });

            return handleResponse(res, response, 200);
        } catch (error) {
            next(error);
        }
    }

    manageUser = async (req: AuthRequest & Request<IManageUserParams>, res: Response, next: NextFunction) => {
        try {
            const { uuid_user } = req.params;
            await this.userService.getById({
                id: uuid_user,
                uuid_company: this.isSaasOwner(req) ? undefined : req.user?.uuid_company
            });
            const response = await this.userManagerService.manageUser(uuid_user);

            return handleResponse(res, response, 200);
        } catch (error) {
            next(error);
        }
    }

    deleteUser = async (req: AuthRequest & Request<IDeleteUserParams>, res: Response, next: NextFunction) => {
        try {
            const { uuid_user } = req.params;
            const response = await this.userService.delete(uuid_user, {
                uuid_company: this.isSaasOwner(req) ? undefined : req.user?.uuid_company
            });

            return handleResponse(res, response, 200);
        } catch (error) {
            next(error);
        }
    }
}

export default UserController;
