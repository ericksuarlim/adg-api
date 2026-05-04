import {UserRole} from "../interfaces/roles/roles.interface";

export const isValidRole = (role: string): role is UserRole => {
    return Object.values(UserRole).includes(role as UserRole);
};