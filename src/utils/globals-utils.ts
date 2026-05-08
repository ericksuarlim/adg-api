import {normalizeUserRole, UserRole} from "../interfaces/roles/roles.interface";

export const isValidRole = (role: string): role is UserRole => {
    return normalizeUserRole(role) !== null;
};