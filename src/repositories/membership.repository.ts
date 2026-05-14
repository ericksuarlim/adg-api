import { IMembershipRepository } from "../interfaces/repositories/membership-repository.interface";
import { UserRanchModel, UserModel } from "../database/models";
import { normalizeUserRole, UserRole } from "../interfaces/roles/roles.interface";
class MembershipRepository implements IMembershipRepository {
    async findActiveRolesByUser(uuid_user: string, uuid_company: string): Promise<UserRole[]> {
        const user = await UserModel.findOne({
            where: {
                uuid_user,
                uuid_company,
                is_active: true,
            },
        });

        const fromColumn = user?.role != null ? normalizeUserRole(String(user.role)) : null;
        if (fromColumn) {
            return [fromColumn];
        }

        const memberships = await UserRanchModel.findAll({
            where: {
                uuid_user,
                uuid_company,
                is_active: true,
            },
        });

        const uniqueRoles = Array.from(
            new Set(
                memberships
                    .map((membership) => normalizeUserRole(membership.role))
                    .filter((role): role is UserRole => role !== null)
            )
        );
        return uniqueRoles;
    }
}

export default MembershipRepository;
