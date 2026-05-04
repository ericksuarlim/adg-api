import { Response, NextFunction } from 'express';
import { AuthRequest } from '../interfaces/middleware/auth-middleware.interface';
import { verifyToken } from '../helpers/jwt.helper';
import ApiError from '../errors/apiError';
import httpStatus from '../errors/httpStatusCodes';
import { JwtPayload } from "../interfaces/common/jwt-payload.interface";
import { AUTHORIZATION_SCHEME_BEARER } from "../constants/auth.constants";

const isJwtPayload = (value: unknown): value is JwtPayload => {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const payload = value as Partial<JwtPayload>;
    return typeof payload.sub === 'string'
        && typeof payload.username === 'string'
        && typeof payload.uuid_company === 'string';
};

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return next(new ApiError({
            name: 'AuthorizationHeaderMissing',
            statusCode: httpStatus.UNAUTHORIZED,
            description: 'Access token required',
            isOperational: true,
        }));
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== AUTHORIZATION_SCHEME_BEARER) {
        return next(new ApiError({
            name: 'InvalidAuthorizationScheme',
            statusCode: httpStatus.UNAUTHORIZED,
            description: 'Authorization scheme must be Bearer',
            isOperational: true,
        }));
    }

    if (!token) {
        return next(new ApiError({
            name: 'TokenMissing',
            statusCode: httpStatus.UNAUTHORIZED,
            description: 'Token not provided',
            isOperational: true,
        }));
    }

    try {
        const decoded = verifyToken(token);

        if (!isJwtPayload(decoded)) {
            throw new TypeError('Invalid token claims');
        }

        req.user = decoded;
        next();
    } catch {
        return next(new ApiError({
            name: 'InvalidToken',
            statusCode: httpStatus.UNAUTHORIZED,
            description: 'Token is invalid or expired',
            isOperational: true,
        }));
    }
};
