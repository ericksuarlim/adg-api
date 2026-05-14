import { UserRole } from "../roles/roles.interface";

/**
 * Legacy bridge: resolves JWT roles from `users.role`, falling back to `user_ranches` rows
 * until all environments are migrated.
 */
export interface IMembershipRepository {
    findActiveRolesByUser(uuid_user: string, uuid_company: string): Promise<UserRole[]>;
}
