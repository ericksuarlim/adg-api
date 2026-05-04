import { NextFunction, Response } from "express";
import ApiError from "../errors/apiError";
import HttpStatusCodes from "../errors/httpStatusCodes";
import { AuthRequest } from "../interfaces/middleware/auth-middleware.interface";
import { Permission, PERMISSION_ROLE_MAP } from "../constants/authorization.constants";

export const authorize = (permission: Permission) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        const roles = req.user?.roles ?? [];
        const allowedRoles = PERMISSION_ROLE_MAP[permission];

        const hasPermission = roles.some((role) => allowedRoles.includes(role));
        if (!hasPermission) {
            return next(new ApiError({
                name: 'Forbidden',
                statusCode: HttpStatusCodes.FORBIDDEN,
                description: 'Insufficient permissions for this operation'
            }));
        }

        next();
    };
};
