import { IMembershipRepository } from "../interfaces/repositories/membership-repository.interface";
import { RanchModel, UserRanchModel } from "../database/models";
import {UserRanchCreationAttributes} from "../interfaces/ranch/user-ranch.interface";
import {IBaseParams} from "../interfaces/params/query.interface";
import {UserRole} from "../interfaces/roles/roles.interface";
class MembershipRepository implements IMembershipRepository<UserRanchModel, UserRanchCreationAttributes> {

    async create(data: UserRanchCreationAttributes): Promise<UserRanchModel> {
        return await UserRanchModel.create(data);
    }

    async findMembership(uuid_user: string, uuid_ranch: string): Promise<UserRanchModel | null> {
        return await UserRanchModel.findOne({
            where: { uuid_user, uuid_ranch }
        });
    }

    async updateRole(uuid_user: string, uuid_ranch: string, role: UserRole): Promise<UserRanchModel | null> {
        const membership = await UserRanchModel.findOne({
            where: { uuid_user, uuid_ranch }
        });

        if (!membership) return null;

        if (membership.role === role) {
            return membership;
        }

        membership.role = role;
        await membership.save();

        return membership;
    }

    async remove(uuid_user: string, uuid_ranch: string): Promise<boolean> {
        const [count] = await UserRanchModel.update(
            { is_active: false },
            { where: { uuid_user, uuid_ranch, is_active: true } }
        );

        return count > 0;
    }

    async findUsersByRanch(
        uuid_ranch: string,
        params: IBaseParams
    ): Promise<{rows: UserRanchModel[], count: number}> {
        const { page, size, sortBy, order, status } = params;

        const offset = (page - 1) * size;

        const where: any = {
            uuid_ranch: uuid_ranch
        };

        if (status === 'active') {
            where.is_active = true;
        } else if (status === 'inactive') {
            where.is_active = false;
        }

        return await UserRanchModel.findAndCountAll({
            where,
            offset,
            limit: size,
            order: [[sortBy, order]],
        });
    }

    async findRanchesByUser(
        uuid_user: string,
        params: IBaseParams
    ): Promise<{rows: UserRanchModel[], count: number}> {
        const { page, size, sortBy, order, status } = params;

        const offset = (page - 1) * size;

        const where: any = {
            uuid_user: uuid_user
        };

        if (status === 'active') {
            where.is_active = true;
        } else if (status === 'inactive') {
            where.is_active = false;
        }

        return await UserRanchModel.findAndCountAll({
            where,
            offset,
            limit: size,
            order: [[sortBy, order]],
        });
    }

    async findActiveRolesByUser(uuid_user: string, uuid_company: string): Promise<UserRole[]> {
        const memberships = await UserRanchModel.findAll({
            where: {
                uuid_user,
                is_active: true,
            },
            include: [
                {
                    model: RanchModel,
                    as: 'ranch',
                    attributes: [],
                    where: {
                        uuid_company,
                        is_active: true,
                    },
                    required: true,
                }
            ],
        });

        const uniqueRoles = Array.from(new Set(memberships.map((membership) => membership.role)));
        return uniqueRoles;
    }
}

export default MembershipRepository;