import jwt from 'jsonwebtoken';
import AuthenticationRepository from '../repositories/authentication.repository';
import SessionServiceClass from './session.service';
import SessionModel from '../database/models/session.model';
import UserServiceClass from './user.services';
import UserModel from '../database/models/user.model';
import { ServiceResponse } from '../interfaces/common/service-response.interface';
import { LoginData, ResetPasswordData, LogoutData } from '../interfaces/authentication/authentication-data.interface';
import { IAuthenticationService } from '../interfaces/services/authentication-service.interface';
import {SessionData} from "../interfaces/session/session-data.interface";
import {UserCreationAttributes} from "../interfaces/user/user.interface";

class AuthenticationService implements IAuthenticationService {
    private repository: AuthenticationRepository;
    private sessionService: SessionServiceClass;
    private userService: UserServiceClass;

    constructor() {
        this.repository = new AuthenticationRepository();
        this.sessionService = new SessionServiceClass(SessionModel);
        this.userService = new UserServiceClass(UserModel);
    }

    async login(data: LoginData): Promise<ServiceResponse<any>> {
        const { user_name, password } = data;

        const userExists = await this.repository.ValidateUser(user_name);
        if (!userExists) {
            return { success: false, error: 'Wrong user', code: 404 };
        }

        const decodedPassword = this.fromBinary(Buffer.from(password, 'base64').toString());
        const passwordValid = await this.repository.ValidatePassword(decodedPassword, user_name);

        if (!passwordValid) {
            return { success: false, error: 'Wrong password', code: 401 };
        }

        const token = jwt.sign({ name: user_name }, 'secreto', { expiresIn: '8h' });

        const session = {
            user_name,
            user_token: token,
            active: true,
            login_date: new Date().toLocaleString('en-US', { timeZone: 'America/La_Paz' }),
        } as SessionData;

        await this.sessionService.logout(user_name);
        const response = await this.sessionService.createSession(session);

        if (!response) {
            return { success: false, error: 'Failed to create session', code: 500 };
        }

        const user = await this.userService.getUserByName(response.data.user_name as string);

        return {
            success: true,
            data: {
                session: response.data,
                user,
                token,
            },
        };
    }

    async logout(data: LogoutData): Promise<ServiceResponse<null>> {
        const response = await this.sessionService.logout(data.user_name);

        if (!response) {
            return { success: false, error: 'Logout failed or user not found', code: 404 };
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
        const { uuid_user, code } = data;

        const userExists = await this.repository.ValidateUserId(uuid_user);
        if (!userExists) {
            return { success: false, error: 'Wrong user', code: 404 };
        }

        const validCode = await this.repository.ValidateCode(uuid_user, code);
        if (!validCode) {
            return { success: false, error: 'Invalid code. Request a new one.', code: 400 };
        }

        const userResponse = await this.userService.getById(uuid_user);
        const response = await this.userService.update(uuid_user, userResponse.data as UserCreationAttributes);

        if (!response) return { success: false, error: 'User doesnt updated', code: 400 };

        return {
            success: true,
            data: response.data,
        };
    }

    private fromBinary(binary: string): string {
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return String.fromCharCode(...new Uint16Array(bytes.buffer));
    }
}

export default AuthenticationService;
