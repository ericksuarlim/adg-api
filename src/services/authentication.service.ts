import jwt from 'jsonwebtoken';
import { ServiceResponse } from '../interfaces/common/service-response.interface';
import { LoginData, ResetPasswordData, LogoutData } from '../interfaces/authentication/authentication-data.interface';
import { IAuthenticationService } from '../interfaces/services/authentication-service.interface';
import {UserAttributes, UserCreationAttributes} from "../interfaces/user/user.interface";
import {IAuthenticationDBRepository} from "../interfaces/repositories/authentication-repository.interface";
import {ISessionService} from "../interfaces/services/session-service.interface";
import {SessionAttributes, SessionCreationAttributes} from "../interfaces/session/session.interface";
import {IBaseServiceInterface} from "../interfaces/services/base-service.interface";
import ApiError from "../errors/apiError";
import HttpStatusCodes from "../errors/httpStatusCodes";
import {envConfig} from "../config";
import {IUserManagerServiceInterface} from "../interfaces/services/user-service.interface";

class AuthenticationService implements IAuthenticationService {
    private authenticationRepository: IAuthenticationDBRepository;
    private sessionService: ISessionService<SessionAttributes>;
    private userService: IBaseServiceInterface<UserAttributes, UserCreationAttributes>;
    private SESSION_EXPIRATION_TIME = '8h';
    private userManagerService: IUserManagerServiceInterface<UserAttributes>

    constructor(
        authenticationRepository: IAuthenticationDBRepository,
        sessionService: ISessionService<SessionAttributes>,
        userService: IBaseServiceInterface<UserAttributes, UserCreationAttributes>,
        userManagerService: IUserManagerServiceInterface<UserAttributes>
    ) {
        this.authenticationRepository = authenticationRepository;
        this.sessionService = sessionService;
        this.userService = userService;
        this.userManagerService = userManagerService;
    }

    async login(data: LoginData): Promise<ServiceResponse<any>> {
        const { user_name, password } = data;

        if (!user_name || user_name.trim() === '') {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Username is required'
            });
        }

        const userExists = await this.authenticationRepository.validateUser(user_name);

        if (!userExists) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Wrong user'
            });
        }

        const passwordValid = await this.authenticationRepository.validatePassword(password, user_name);

        if (!passwordValid) {
            throw new ApiError({
                name: 'Unauthorized',
                statusCode: HttpStatusCodes.UNAUTHORIZED,
                description: 'Wrong password'
            });
        }

        const token = jwt.sign({ name: user_name }, envConfig.JWT_SECRET, { expiresIn: this.SESSION_EXPIRATION_TIME });

        const session: SessionCreationAttributes = {
            user_name,
            user_token: token,
            is_active: true,
            login_date: new Date(),
        };

        await this.sessionService.logout(user_name);

        const sessionResponse = await this.sessionService.createSession(session);

        if (!sessionResponse.success) {
            throw new ApiError({
                name: 'InternalError',
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
                description: 'Failed to create session'
            });
        }

        const userResponse = await this.userManagerService.getUserByName(user_name);

        return {
            success: true,
            data: {
                session: sessionResponse.data,
                user: userResponse.data,
                token,
            },
        };
    }

    async logout(data: LogoutData): Promise<ServiceResponse<null>> {
        if (!data.user_name || data.user_name.trim() === '') {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Username is required'
            });
        }

        const response = await this.sessionService.logout(data.user_name);

        if (!response) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Logout failed or user not found'
            });
        }

        return { success: true, data: null };
    }

    async requestNewPassword(): Promise<ServiceResponse<null>> {
        return {
            success: false,
            error: 'RequestNewPassword not implemented yet',
            code: 501,
        };
    }

    async resetPassword(data: ResetPasswordData): Promise<ServiceResponse<any>> {
        const { uuid_user, code, password } = data;

        if (!uuid_user) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'uuid_user is required'
            });
        }

        const userExists = await this.authenticationRepository.validateUserId(uuid_user);

        if (!userExists) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Wrong user'
            });
        }

        const validCode = await this.authenticationRepository.validateCode(uuid_user, code);

        if (!validCode) {
            throw new ApiError({
                name: 'BadRequest',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Invalid code. Request a new one.'
            });
        }

        const updatedUser = await this.userManagerService.resetPassword(
            uuid_user,
            password
        );

        if (!updatedUser.success) {
            throw new ApiError({
                name: 'BadRequest',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Error updating password'
            });
        }

        return {
            success: true,
            data: null,
        };
    }
}

export default AuthenticationService;
