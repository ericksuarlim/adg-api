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
import { IncludeInactiveQuery } from '../interfaces/params/query.interface';

class UserController {
    private userService: IBaseServiceInterface<UserAttributes, UserCreationAttributes>;
    private userManagerService: IUserManagerServiceInterface<UserAttributes>;

    constructor(
        userService: IBaseServiceInterface<UserAttributes, UserCreationAttributes>,
        userManagerService: IUserManagerServiceInterface<UserAttributes>
    ) {
        this.userService = userService;
        this.userManagerService = userManagerService;
    }

    createUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userBody = req.body as UserCreationAttributes;
            const response = await this.userService.create(userBody);

            return handleResponse(res, response, 201);
        } catch (error) {
            next(error);
        }
    }

    getUser = async (        
        req: Request<IGetUserParams, {}, {}, IncludeInactiveQuery>, 
        res: Response, next: NextFunction
    ) => {
        try {
            const { uuid_user } = req.params;
            const { includeInactive } = buildGetByIdParams(req.query);

            const response = await this.userService.getById({ id: uuid_user, includeInactive });

            return handleResponse(res, response, 200);
        } catch (error) {
            next(error);
        }
    }

    getUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const params = buildGetAllParams(req.query);

            const response = await this.userService.getAll(params);

            return handleResponse(res, response, 200);
        } catch (error) {
            next(error);
        }
    }

    updateUser = async (req: Request<IUpdateUserParams>, res: Response, next: NextFunction) => {
        try {
            const { uuid_user } = req.params;
            const userBody = req.body as UserCreationAttributes;
            const response = await this.userService.update(uuid_user, userBody);

            return handleResponse(res, response, 200);
        } catch (error) {
            next(error);
        }
    }

    manageUser = async (req: Request<IManageUserParams>, res: Response, next: NextFunction) => {
        try {
            const { uuid_user } = req.params;
            const response = await this.userManagerService.manageUser(uuid_user);

            return handleResponse(res, response, 200);
        } catch (error) {
            next(error);
        }
    }

    deleteUser = async (req: Request<IDeleteUserParams>, res: Response, next: NextFunction) => {
        try {
            const { uuid_user } = req.params;
            const response = await this.userService.delete(uuid_user);

            return handleResponse(res, response, 200);
        } catch (error) {
            next(error);
        }
    }
}

export default UserController;
