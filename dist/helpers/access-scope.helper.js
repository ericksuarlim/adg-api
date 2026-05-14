"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeAccessScope = computeAccessScope;
exports.resolveAccessScope = resolveAccessScope;
exports.assertTenantCompany = assertTenantCompany;
exports.assertRanchInTenant = assertRanchInTenant;
exports.assertRanchTokenAccess = assertRanchTokenAccess;
exports.ranchFilterFromUser = ranchFilterFromUser;
const apiError_1 = __importDefault(require("../errors/apiError"));
const httpStatusCodes_1 = __importDefault(require("../errors/httpStatusCodes"));
const roles_interface_1 = require("../interfaces/roles/roles.interface");
/**
 * Alcance geográfico (qué ranchos de la compañía puede tocar la API):
 * - `saas_global`: SaaS owner.
 * - `company_all_ranches`: administrador y operador (`ranch_staff`) operan en cualquier rancho de su compañía.
 *   La diferencia staff vs administrador es de permisos (módulos), no de rancho.
 * - `single_ranch`: legado en JWT; ya no se emite desde `computeAccessScope`.
 */
function computeAccessScope(roles) {
    if (roles.includes(roles_interface_1.UserRole.SAAS_OWNER)) {
        return "saas_global";
    }
    if (roles.includes(roles_interface_1.UserRole.ADMINISTRATOR) || roles.includes(roles_interface_1.UserRole.RANCH_STAFF)) {
        return "company_all_ranches";
    }
    return "company_all_ranches";
}
function resolveAccessScope(user) {
    return computeAccessScope((0, roles_interface_1.normalizeUserRoles)(user?.roles ?? []));
}
function assertTenantCompany(user, uuid_company) {
    if (!uuid_company || !user) {
        return;
    }
    if (resolveAccessScope(user) === "saas_global") {
        return;
    }
    if (user.uuid_company !== uuid_company) {
        throw new apiError_1.default({
            name: "Forbidden",
            statusCode: httpStatusCodes_1.default.FORBIDDEN,
            description: "Cross-company access denied",
        });
    }
}
function assertRanchInTenant(user, ranchCompanyUuid) {
    if (!user) {
        throw new apiError_1.default({
            name: "Unauthorized",
            statusCode: httpStatusCodes_1.default.UNAUTHORIZED,
            description: "Authentication required",
        });
    }
    if (resolveAccessScope(user) === "saas_global") {
        return;
    }
    if (ranchCompanyUuid !== user.uuid_company) {
        throw new apiError_1.default({
            name: "Forbidden",
            statusCode: httpStatusCodes_1.default.FORBIDDEN,
            description: "Ranch is outside your company",
        });
    }
}
function assertRanchTokenAccess(user, uuid_ranch) {
    if (!user) {
        throw new apiError_1.default({
            name: "Unauthorized",
            statusCode: httpStatusCodes_1.default.UNAUTHORIZED,
            description: "Authentication required",
        });
    }
    const scope = resolveAccessScope(user);
    if (scope === "saas_global") {
        return;
    }
    if (scope === "company_all_ranches") {
        return;
    }
    const allowed = user.ranch_uuids ?? [];
    if (allowed.length === 0) {
        throw new apiError_1.default({
            name: "Forbidden",
            statusCode: httpStatusCodes_1.default.FORBIDDEN,
            description: "No ranch access configured for this account",
        });
    }
    if (!allowed.includes(uuid_ranch)) {
        throw new apiError_1.default({
            name: "Forbidden",
            statusCode: httpStatusCodes_1.default.FORBIDDEN,
            description: "Ranch access denied",
        });
    }
}
function ranchFilterFromUser(user) {
    if (resolveAccessScope(user) === "single_ranch") {
        return user?.ranch_uuids?.length ? user.ranch_uuids : undefined;
    }
    return undefined;
}
