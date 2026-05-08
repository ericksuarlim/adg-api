import jwt from 'jsonwebtoken';
import { ServiceResponse } from '../interfaces/common/service-response.interface';
import { LoginData, ResetPasswordData, LogoutData } from '../interfaces/authentication/authentication-data.interface';
import { IAuthenticationService } from '../interfaces/services/authentication-service.interface';
import {UserAttributes} from "../interfaces/user/user.interface";
import {IAuthenticationDBRepository} from "../interfaces/repositories/authentication-repository.interface";
import {ISessionService} from "../interfaces/services/session-service.interface";
import {SessionAttributes, SessionCreationAttributes} from "../interfaces/session/session.interface";
import ApiError from "../errors/apiError";
import HttpStatusCodes from "../errors/httpStatusCodes";
import {envConfig} from "../config";
import {IUserManagerServiceInterface} from "../interfaces/services/user-service.interface";
import { UserRole } from "../interfaces/roles/roles.interface";
import { SESSION_EXPIRATION_TIME } from "../constants/auth.constants";
import { IMembershipRepository } from "../interfaces/repositories/membership-repository.interface";
import { CompanyModel, UserRanchModel } from "../database/models";
import { UserRanchCreationAttributes } from "../interfaces/ranch/user-ranch.interface";

class AuthenticationService implements IAuthenticationService {
    private readonly authenticationRepository: IAuthenticationDBRepository;
    private readonly sessionService: ISessionService<SessionAttributes>;
    private readonly SESSION_EXPIRATION_TIME = SESSION_EXPIRATION_TIME;
    private readonly userManagerService: IUserManagerServiceInterface<UserAttributes>;
    private readonly membershipRepository: IMembershipRepository<UserRanchModel, UserRanchCreationAttributes>;

    constructor(
        authenticationRepository: IAuthenticationDBRepository,
        sessionService: ISessionService<SessionAttributes>,
        userManagerService: IUserManagerServiceInterface<UserAttributes>,
        membershipRepository: IMembershipRepository<UserRanchModel, UserRanchCreationAttributes>
    ) {
        this.authenticationRepository = authenticationRepository;
        this.sessionService = sessionService;
        this.userManagerService = userManagerService;
        this.membershipRepository = membershipRepository;
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

        await this.sessionService.deactivateExpiredSessions(user_name);
        await this.sessionService.logout(user_name);

        const userResponse = await this.userManagerService.getUserByName(user_name);
        const user = userResponse.data;

        if (!userResponse.success || !user) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'User not found'
            });
        }
        const membershipRoles = await this.membershipRepository.findActiveRolesByUser(
            user.uuid_user,
            user.uuid_company
        );
        const roles = membershipRoles.length > 0
            ? membershipRoles
            : [UserRole.USER];

        const company = await CompanyModel.findOne({
            where: {
                uuid_company: user.uuid_company,
                is_active: true
            }
        });

        const token = jwt.sign(
            {
                sub: user.uuid_user,
                username: user.username,
                uuid_company: user.uuid_company,
                roles,
                membership_status: company?.membership_status,
                membership_renewal_at: company?.membership_renewal_at
                    ? company.membership_renewal_at.toISOString()
                    : undefined,
            },
            envConfig.JWT_SECRET,
            { expiresIn: this.SESSION_EXPIRATION_TIME }
        );

        const session: SessionCreationAttributes = {
            user_name,
            user_token: token,
            is_active: true,
            login_date: new Date(),
        };

        const sessionResponse = await this.sessionService.createSession(session);

        if (!sessionResponse.success) {
            throw new ApiError({
                name: 'InternalError',
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
                description: 'Failed to create session'
            });
        }

        return {
            success: true,
            data: {
                session: sessionResponse.data,
                user: userResponse.data,
                token,
            },
        };
    }

    async logout(data: LogoutData, currentUsername?: string): Promise<ServiceResponse<null>> {
        const usernameToLogout = currentUsername ?? data.user_name;

        if (!usernameToLogout || usernameToLogout.trim() === '') {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Username is required'
            });
        }

        const response = await this.sessionService.logout(usernameToLogout);

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
