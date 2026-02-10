import { Request, Response, NextFunction } from 'express';
import UserService from '../services/user.services';
import UserModel from "../database/models/user.model";
import { UserCreationAttributes } from "../interfaces/user/user.interface";

class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService(UserModel);

        this.createUser = this.createUser.bind(this);
        this.getUser = this.getUser.bind(this);
        this.getUsers = this.getUsers.bind(this);
        this.updateUser = this.updateUser.bind(this);
        this.manageUser = this.manageUser.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
    }

    async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userBody = req.body as UserCreationAttributes;
            const response = await this.userService.create(userBody);

            if (!response.success) {
                return res.status(response.code ?? 500).json(response);
            }

            return res.status(201).json(response);
        } catch (error) {
            next(error);
        }
    }

    async getUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { uuid_user } = req.params;
            const response = await this.userService.getById(uuid_user);

            if (!response.success) {
                return res.status(response.code ?? 500).json(response);
            }

            return res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    async getUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const size = parseInt(req.query.size as string) || 10;
            const sortBy = (req.query.sortBy as string) || 'createdAt';
            const order = (((req.query.order as string) || 'desc').toUpperCase() as 'ASC' | 'DESC');

            const response = await this.userService.getAll({ page, size, sortBy, order });

            if (!response.success) {
                return res.status(response.code ?? 500).json(response);
            }

            return res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { uuid_user } = req.params;
            const userBody = req.body as UserCreationAttributes;
            const response = await this.userService.update(uuid_user, userBody);

            if (!response.success) {
                return res.status(response.code ?? 500).json(response);
            }

            return res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    async manageUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { uuid_user } = req.params;
            const response = await this.userService.manageUser(uuid_user);

            if (!response.success) {
                return res.status(response.code ?? 500).json(response);
            }

            return res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { uuid_user } = req.params;
            const response = await this.userService.delete(uuid_user);

            if (!response.success) {
                return res.status(response.code ?? 500).json(response);
            }

            return res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }
}

export default new UserController();
