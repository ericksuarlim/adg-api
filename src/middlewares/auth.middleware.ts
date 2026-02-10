import { Response, NextFunction } from 'express';
import { AuthRequest } from '../interfaces/middleware/auth-middleware.interface';
import { verifyToken } from '../helpers/jwt.helper';
import ApiError from '../errors/apiError';
import httpStatus from '../errors/httpStatusCodes';

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

    const token = authHeader.split(' ')[1];

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
