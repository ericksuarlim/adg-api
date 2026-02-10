import AuthenticationRepository from '../repositories/autentication.repository';
import ApiError from '../errors/apiError';
import SessionServiceClass from './session.service';
import SessionModel from '../database/models/session';
import UserServiceClass from './user.services';
import UserModel from '../database/models/user';
import jwt from 'jsonwebtoken';
import httpStatusCodes from '../errors/httpStatusCodes';

interface LoginData {
    user_name: string;
    password: string;
}

interface ResetPasswordData {
    uuid_user: string;
    code: string;
    // Otros campos necesarios para reset
}

class ServicioAutenticacion {
    private repository: AuthenticationRepository;
    private sessionService: SessionServiceClass;
    private userService: UserServiceClass;

    constructor() {
        this.repository = new AuthenticationRepository();
        this.sessionService = new SessionServiceClass(SessionModel);
        this.userService = new UserServiceClass(UserModel);
    }

    async Login(data: LoginData) {
        const userExists = await this.repository.ValidateUser(data.user_name);

        if (!userExists) {
            throw new ApiError({
                name: 'NOT_FOUND',
                statusCode: httpStatusCodes.NOT_FOUND,
                description: 'Wrong user',
                isOperational: false,
            });
        }

        const decodedPassword = this.fromBinary(Buffer.from(data.password, 'base64').toString());

        const passwordValid = await this.repository.ValidatePassword(decodedPassword, data.user_name);

        if (!passwordValid) {
            throw new ApiError({
                name: 'NOT_FOUND',
                statusCode: httpStatusCodes.NOT_FOUND,
                description: 'Wrong password',
                isOperational: false,
            });
        }

        const token = jwt.sign(
            { name: data.user_name },
            'secreto', // idealmente usar variable de entorno
            { expiresIn: '8h' }
        );

        const session = {
            user_name: data.user_name,
            user_token: token,
            active: true,
            login_date: new Date().toLocaleString('en-US', { timeZone: 'America/La_Paz' }),
        };

        await this.sessionService.Logout(data.user_name);
        const createdSession = await this.sessionService.CreateSession(session);
        const usuario = await this.userService.GetUserByName(createdSession.user_name);

        return { error: null, sesion: createdSession, usuario_registrado: usuario, isOperational: true };
    }

    async Logout(data: { user_name: string }) {
        const response = await this.sessionService.Logout(data.user_name);
        return { response };
    }

    async ResetPassword(data: ResetPasswordData) {
        const userExists = await this.repository.ValidateUserId(data.uuid_user);

        if (!userExists) {
            throw new ApiError({
                name: 'NOT_FOUND',
                statusCode: httpStatusCodes.NOT_FOUND,
                description: 'Wrong user',
                isOperational: false,
            });
        }

        const validCode = await this.repository.ValidateCode(data.uuid_user, data.code);

        if (!validCode) {
            throw new ApiError({
                name: 'BAD_REQUEST',
                statusCode: httpStatusCodes.BAD_REQUEST,
                description: 'Code error, request a new code',
                isOperational: false,
            });
        }

        const newUser = await this.userService.ResetPassword(data);
        return { error: null, new_user: newUser, isOperational: true };
    }

    private fromBinary(binary: string): string {
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return String.fromCharCode(...new Uint16Array(bytes.buffer));
    }
}

export default ServicioAutenticacion;
