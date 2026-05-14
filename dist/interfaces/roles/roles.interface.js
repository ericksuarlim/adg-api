"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeUserRoles = exports.isValidAssignableRole = exports.normalizeUserRole = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["SAAS_OWNER"] = "saas_owner";
    UserRole["ADMINISTRATOR"] = "administrator";
    UserRole["RANCH_STAFF"] = "ranch_staff";
})(UserRole || (exports.UserRole = UserRole = {}));
const CANONICAL_ROLE_STRINGS = Object.values(UserRole);
/** Acepta solo los tres roles canónicos (comparación exacta o en minúsculas). */
const normalizeUserRole = (role) => {
    const trimmed = typeof role === 'string' ? role.trim() : '';
    if (!trimmed) {
        return null;
    }
    if (CANONICAL_ROLE_STRINGS.includes(trimmed)) {
        return trimmed;
    }
    const lower = trimmed.toLowerCase();
    if (CANONICAL_ROLE_STRINGS.includes(lower)) {
        return lower;
    }
    return null;
};
exports.normalizeUserRole = normalizeUserRole;
/** Roles asignables en membresía rancho–usuario (no incluye SaaS owner). */
const isValidAssignableRole = (role) => role === UserRole.ADMINISTRATOR || role === UserRole.RANCH_STAFF;
exports.isValidAssignableRole = isValidAssignableRole;
const normalizeUserRoles = (roles) => {
    const normalized = roles
        .map((role) => (0, exports.normalizeUserRole)(role))
        .filter((role) => role !== null);
    return Array.from(new Set(normalized));
};
exports.normalizeUserRoles = normalizeUserRoles;
