import { Request, Response, NextFunction } from 'express';
import {LoginData, LogoutData, ResetPasswordData} from "../interfaces/authentication/authentication-data.interface";
import {handleResponse} from "../utils/response.handler";
import {IAuthenticationService} from "../interfaces/services/authentication-service.interface";
import { AuthRequest } from "../interfaces/middleware/auth-middleware.interface";

class AuthenticationController {
    private readonly authenticationService: IAuthenticationService;

    constructor(authenticationService: IAuthenticationService) {
        this.authenticationService = authenticationService;
    }

    requestNewPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const response = await this.authenticationService.requestNewPassword();

            return handleResponse(res, response, 201);
        } catch (error) {
            next(error);
        }
    }

    resetPassword = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const resetPasswordData = req.body as ResetPasswordData;
            const response = await this.authenticationService.resetPassword(resetPasswordData);

            return handleResponse(res, response, 201);
        } catch (error) {
            next(error);
        }
    }

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { user_name, password } = req.body as LoginData;
            const response = await this.authenticationService.login({user_name, password});

            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    }

    logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const logoutData = req.body as LogoutData;
            const response = await this.authenticationService.logout(logoutData, req.user?.username);

            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    }

    me = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            return handleResponse(res, {
                success: true,
                data: {
                    username: req.user?.username,
                    uuid_company: req.user?.uuid_company,
                    roles: req.user?.roles,
                    membership_status: req.user?.membership_status,
                    membership_renewal_at: req.user?.membership_renewal_at
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

export default AuthenticationController;
