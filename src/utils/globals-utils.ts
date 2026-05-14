import { isValidAssignableRole, UserRole } from "../interfaces/roles/roles.interface";

export const isValidRole = (role: string): role is UserRole => isValidAssignableRole(role);