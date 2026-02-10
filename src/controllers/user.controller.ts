import { Request, Response, NextFunction } from 'express';
import UserService from '../services/user.service';

class UserController {
    private userService = new UserService();

    constructor() {
        this.createUser = this.createUser.bind(this);
        this.getUser = this.getUser.bind(this);
        this.getUsers = this.getUsers.bind(this);
        this.updateUser = this.updateUser.bind(this);
        this.manageUser = this.manageUser.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
    }

    async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await this.userService.CreateUser(req.body);
            res.status(201).json(user);
        } catch (error) {
            next(error);
        }
    }

    async getUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { uuid_user } = req.params;
            const user = await this.userService.GetUser(uuid_user);
            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }

    async getUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await this.userService.GetUsers();
            res.status(200).json(users);
        } catch (error) {
            next(error);
        }
    }

    async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { uuid_user } = req.params;
            const updated = await this.userService.UpdateUser(uuid_user, req.body);
            res.status(200).json(updated);
        } catch (error) {
            next(error);
        }
    }

    async manageUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { uuid_user } = req.params;
            const updated = await this.userService.ManageUser(uuid_user, req.body);
            res.status(200).json(updated);
        } catch (error) {
            next(error);
        }
    }

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { uuid_user } = req.params;
            const deleted = await this.userService.DeleteUser(uuid_user);
            res.status(200).json(deleted);
        } catch (error) {
            next(error);
        }
    }
}

export default new UserController();
