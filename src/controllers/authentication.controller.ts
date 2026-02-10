import { Request, Response, NextFunction } from 'express';
import AuthenticationService from '../services/authentication.service';
import {LoginData, LogoutData, ResetPasswordData} from "../interfaces/authentication/authentication-data.interface";

class AuthenticationController {
    private authenticationService: AuthenticationService;

    constructor() {
        this.authenticationService = new AuthenticationService();

        this.requestNewPassword = this.requestNewPassword.bind(this);
        this.resetPassword = this.resetPassword.bind(this);
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
    }

    async requestNewPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const response = await this.authenticationService.requestNewPassword();

            if (!response.success) {
                return res.status(response.code ?? 500).json(response);
            }

            res.status(201).json(response);
        } catch (error) {
            next(error);
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const resetPasswordData = req.body as ResetPasswordData;
            const response = await this.authenticationService.resetPassword(resetPasswordData);

            if (!response.success) {
                return res.status(response.code ?? 500).json(response);
            }

            res.status(201).json(response);
        } catch (error) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            console.log('LOGIN HIT');
            const { user_name, password } = req.body as LoginData;
            const response = await this.authenticationService.login({user_name, password});

            if (!response.success) {
                return res.status(response.code ?? 500).json(response);
            }

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const logoutData = req.body as LogoutData;
            const response = await this.authenticationService.logout(logoutData);

            if (!response.success) {
                return res.status(response.code ?? 500).json(response);
            }

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }
}

export default new AuthenticationController();
