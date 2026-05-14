"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../database/models");
const roles_interface_1 = require("../interfaces/roles/roles.interface");
class MembershipRepository {
    async findActiveRolesByUser(uuid_user, uuid_company) {
        const user = await models_1.UserModel.findOne({
            where: {
                uuid_user,
                uuid_company,
                is_active: true,
            },
        });
        const fromColumn = user?.role != null ? (0, roles_interface_1.normalizeUserRole)(String(user.role)) : null;
        if (fromColumn) {
            return [fromColumn];
        }
        const memberships = await models_1.UserRanchModel.findAll({
            where: {
                uuid_user,
                uuid_company,
                is_active: true,
            },
        });
        const uniqueRoles = Array.from(new Set(memberships
            .map((membership) => (0, roles_interface_1.normalizeUserRole)(membership.role))
            .filter((role) => role !== null)));
        return uniqueRoles;
    }
}
exports.default = MembershipRepository;
