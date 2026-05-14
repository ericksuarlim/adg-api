import ApiError from "../errors/apiError";
import HttpStatusCodes from "../errors/httpStatusCodes";
import { JwtPayload, AccessScope } from "../interfaces/common/jwt-payload.interface";
import { normalizeUserRoles, UserRole } from "../interfaces/roles/roles.interface";

/**
 * Alcance de acceso a ranchos según roles en JWT / membresía:
 * - `company_all_ranches`: administrador (y SaaS) puede operar en cualquier rancho activo de su compañía.
 * - `single_ranch`: `ranch_staff` must have exactly one active ranch on login.
 */
export function computeAccessScope(roles: UserRole[]): AccessScope {
    if (roles.includes(UserRole.SAAS_OWNER)) {
        return "saas_global";
    }
    if (roles.includes(UserRole.ADMINISTRATOR)) {
        return "company_all_ranches";
    }
    return "single_ranch";
}

export function resolveAccessScope(user: JwtPayload | undefined): AccessScope {
    if (user?.access_scope) {
        return user.access_scope;
    }
    return computeAccessScope(normalizeUserRoles(user?.roles ?? []));
}

export function assertTenantCompany(user: JwtPayload | undefined, uuid_company: string | undefined): void {
    if (!uuid_company || !user) {
        return;
    }
    if (resolveAccessScope(user) === "saas_global") {
        return;
    }
    if (user.uuid_company !== uuid_company) {
        throw new ApiError({
            name: "Forbidden",
            statusCode: HttpStatusCodes.FORBIDDEN,
            description: "Cross-company access denied",
        });
    }
}

export function assertRanchInTenant(user: JwtPayload | undefined, ranchCompanyUuid: string): void {
    if (!user) {
        throw new ApiError({
            name: "Unauthorized",
            statusCode: HttpStatusCodes.UNAUTHORIZED,
            description: "Authentication required",
        });
    }
    if (resolveAccessScope(user) === "saas_global") {
        return;
    }
    if (ranchCompanyUuid !== user.uuid_company) {
        throw new ApiError({
            name: "Forbidden",
            statusCode: HttpStatusCodes.FORBIDDEN,
            description: "Ranch is outside your company",
        });
    }
}

export function assertRanchTokenAccess(user: JwtPayload | undefined, uuid_ranch: string): void {
    if (!user) {
        throw new ApiError({
            name: "Unauthorized",
            statusCode: HttpStatusCodes.UNAUTHORIZED,
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
        throw new ApiError({
            name: "Forbidden",
            statusCode: HttpStatusCodes.FORBIDDEN,
            description: "No ranch access configured for this account",
        });
    }
    if (!allowed.includes(uuid_ranch)) {
        throw new ApiError({
            name: "Forbidden",
            statusCode: HttpStatusCodes.FORBIDDEN,
            description: "Ranch access denied",
        });
    }
}

export function ranchFilterFromUser(user: JwtPayload | undefined): string[] | undefined {
    if (resolveAccessScope(user) === "single_ranch") {
        return user?.ranch_uuids?.length ? user.ranch_uuids : undefined;
    }
    return undefined;
}
