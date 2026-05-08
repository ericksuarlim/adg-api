export enum UserRole {
    SAAS_OWNER = 'saas_owner',
    ADMINISTRATOR = 'administrator',
    SUPERVISOR = 'supervisor',
    HEALTHCARE_STAFF = 'healthcare_staff',
    USER = 'user',
}

const LEGACY_ROLE_MAP: Record<string, UserRole> = {
    SUPER_ADMIN: UserRole.SAAS_OWNER,
    ADMIN: UserRole.ADMINISTRATOR,
    USER: UserRole.USER,
};

export const normalizeUserRole = (role: string): UserRole | null => {
    if (Object.values(UserRole).includes(role as UserRole)) {
        return role as UserRole;
    }

    return LEGACY_ROLE_MAP[role] ?? null;
};

export const normalizeUserRoles = (roles: string[]): UserRole[] => {
    const normalized = roles
        .map((role) => normalizeUserRole(role))
        .filter((role): role is UserRole => role !== null);

    return Array.from(new Set(normalized));
};
