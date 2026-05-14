export enum UserRole {
    SAAS_OWNER = 'saas_owner',
    ADMINISTRATOR = 'administrator',
    RANCH_STAFF = 'ranch_staff',
}

const CANONICAL_ROLE_STRINGS = Object.values(UserRole) as string[];

/** Acepta solo los tres roles canónicos (comparación exacta o en minúsculas). */
export const normalizeUserRole = (role: string): UserRole | null => {
    const trimmed = typeof role === 'string' ? role.trim() : '';
    if (!trimmed) {
        return null;
    }
    if (CANONICAL_ROLE_STRINGS.includes(trimmed)) {
        return trimmed as UserRole;
    }
    const lower = trimmed.toLowerCase();
    if (CANONICAL_ROLE_STRINGS.includes(lower)) {
        return lower as UserRole;
    }
    return null;
};

/** Roles asignables en membresía rancho–usuario (no incluye SaaS owner). */
export const isValidAssignableRole = (role: string): role is UserRole =>
    role === UserRole.ADMINISTRATOR || role === UserRole.RANCH_STAFF;

export const normalizeUserRoles = (roles: string[]): UserRole[] => {
    const normalized = roles
        .map((role) => normalizeUserRole(role))
        .filter((role): role is UserRole => role !== null);

    return Array.from(new Set(normalized));
};
