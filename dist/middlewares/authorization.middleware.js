"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeAny = exports.authorize = void 0;
const apiError_1 = __importDefault(require("../errors/apiError"));
const httpStatusCodes_1 = __importDefault(require("../errors/httpStatusCodes"));
const authorization_constants_1 = require("../constants/authorization.constants");
const roles_interface_1 = require("../interfaces/roles/roles.interface");
const roleHasAnyPermission = (roles, permissions) => {
    return permissions.some((permission) => {
        const allowedRoles = authorization_constants_1.PERMISSION_ROLE_MAP[permission];
        return roles.some((role) => allowedRoles.includes(role));
    });
};
const authorize = (permission) => {
    return (req, res, next) => {
        const roles = (0, roles_interface_1.normalizeUserRoles)(req.user?.roles ?? []);
        if (!roleHasAnyPermission(roles, [permission])) {
            return next(new apiError_1.default({
                name: 'Forbidden',
                statusCode: httpStatusCodes_1.default.FORBIDDEN,
                description: 'Insufficient permissions for this operation'
            }));
        }
        next();
    };
};
exports.authorize = authorize;
const authorizeAny = (...permissions) => {
    return (req, res, next) => {
        const roles = (0, roles_interface_1.normalizeUserRoles)(req.user?.roles ?? []);
        if (!roleHasAnyPermission(roles, permissions)) {
            return next(new apiError_1.default({
                name: 'Forbidden',
                statusCode: httpStatusCodes_1.default.FORBIDDEN,
                description: 'Insufficient permissions for this operation'
            }));
        }
        next();
    };
};
exports.authorizeAny = authorizeAny;
