import { NextFunction, Response } from "express";
import ApiError from "../errors/apiError";
import HttpStatusCodes from "../errors/httpStatusCodes";
import { AuthRequest } from "../interfaces/middleware/auth-middleware.interface";
import { Permission, PERMISSION_ROLE_MAP } from "../constants/authorization.constants";
import { normalizeUserRoles } from "../interfaces/roles/roles.interface";

const roleHasAnyPermission = (roles: ReturnType<typeof normalizeUserRoles>, permissions: Permission[]): boolean => {
    return permissions.some((permission) => {
        const allowedRoles = PERMISSION_ROLE_MAP[permission];
        return roles.some((role) => allowedRoles.includes(role));
    });
};

export const authorize = (permission: Permission) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        const roles = normalizeUserRoles(req.user?.roles ?? []);
        if (!roleHasAnyPermission(roles, [permission])) {
            return next(new ApiError({
                name: 'Forbidden',
                statusCode: HttpStatusCodes.FORBIDDEN,
                description: 'Insufficient permissions for this operation'
            }));
        }

        next();
    };
};

export const authorizeAny = (...permissions: Permission[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        const roles = normalizeUserRoles(req.user?.roles ?? []);
        if (!roleHasAnyPermission(roles, permissions)) {
            return next(new ApiError({
                name: 'Forbidden',
                statusCode: HttpStatusCodes.FORBIDDEN,
                description: 'Insufficient permissions for this operation'
            }));
        }

        next();
    };
};
