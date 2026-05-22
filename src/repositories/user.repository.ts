import {UserCreationAttributes} from "../interfaces/user/user.interface";
import {IUserManagerRepository} from "../interfaces/repositories/user-repository.interface";
import { CompanyModel, UserModel } from "../database/models";
import {IBaseRepository} from "../interfaces/repositories/base-repository.interface";
import { normalizeLoginCredential } from "../utils/login-credential.util";
import { Op, fn, col, where } from "sequelize";
import { IBaseParams } from "../interfaces/params/query.interface";
class UserRepository implements
    IBaseRepository<UserModel, UserCreationAttributes>,
    IUserManagerRepository<UserModel> {

    async findAll(params: IBaseParams): Promise<{rows: UserModel[], count: number}> {

        const { page, size, sortBy, order, status } = params;

        const offset = (page - 1) * size;

        const baseWhere: Record<string, unknown> = {};

        if (status === 'active') {
            baseWhere.is_active = true;
        } else if (status === 'inactive') {
            baseWhere.is_active = false;
        }
        if (params.uuid_company) {
            baseWhere.uuid_company = params.uuid_company;
        }

        const searchTerm = params.search?.trim();
        const include = searchTerm
            ? [{
                model: CompanyModel,
                as: "company",
                attributes: ["uuid_company", "name"],
                required: false,
            }]
            : [];

        let where: Record<string, unknown> = baseWhere;
        if (searchTerm) {
            const pattern = `%${searchTerm}%`;
            where = {
                [Op.and]: [
                    baseWhere,
                    {
                        [Op.or]: [
                            { username: { [Op.iLike]: pattern } },
                            { email: { [Op.iLike]: pattern } },
                            { first_name: { [Op.iLike]: pattern } },
                            { last_name: { [Op.iLike]: pattern } },
                            { id_card: { [Op.iLike]: pattern } },
                            { "$company.name$": { [Op.iLike]: pattern } },
                        ],
                    },
                ],
            };
        }

        return await UserModel.findAndCountAll({
            where,
            include,
            offset,
            limit: size,
            order: [[sortBy, order]],
            distinct: Boolean(searchTerm),
            subQuery: false,
        });
    }

    async findById(params: { id: string, includeInactive?: boolean, uuid_company?: string }): Promise<UserModel | null> {
        const { id, includeInactive, uuid_company } = params;

        const where: any = { uuid_user: id };

        if (!includeInactive) {
            where.is_active = true;
        }
        if (uuid_company) {
            where.uuid_company = uuid_company;
        }

        return await UserModel.findOne({
            where,
            include: [
                {
                    model: CompanyModel,
                    as: 'company',
                    attributes: ['uuid_company', 'name']
                }
            ]
        });
    }

    async create(data: UserCreationAttributes): Promise<UserModel> {
        return await UserModel.create(data);
    }

    async update(uuid_user: string, data: UserCreationAttributes, options?: { uuid_company?: string }): Promise<UserModel | null> {
        const where: any = { uuid_user, is_active: true };
        if (options?.uuid_company) {
            where.uuid_company = options.uuid_company;
        }

        const [count, updated] = await UserModel.update(data, {
            where,
            returning: true,
        });

        if (count === 0) return null;

        return updated[0];
    }

    async delete(uuid_user: string, options?: { uuid_company?: string }): Promise<boolean> {
        const where: any = { uuid_user, is_active: true };
        if (options?.uuid_company) {
            where.uuid_company = options.uuid_company;
        }

        const [count] = await UserModel.update(
            { is_active: false },
            { where }
        );

        return count > 0;
    }

    async manageUser(uuid_user: string): Promise<UserModel | null> {
        const user = await UserModel.findOne({
            where: { uuid_user, is_active: true }
        });

        if (!user) return null;

        user.is_active = !user.is_active;
        await user.save();

        return user;
    }

    async findUserByName(username: string): Promise<UserModel | null>  {
        const trimmed = normalizeLoginCredential(username);
        if (!trimmed) {
            return null;
        }
        const lowered = trimmed.toLowerCase();
        const user = await UserModel.findOne({
            where: {
                is_active: true,
                [Op.or]: [
                    { username: trimmed },
                    { email: trimmed },
                    where(fn("LOWER", fn("TRIM", col("username"))), Op.eq, lowered),
                    where(fn("LOWER", fn("TRIM", col("email"))), Op.eq, lowered),
                ],
            }
        });

        return user ?? null;
    }

    async resetPassword(uuid_user: string, password: string): Promise<boolean> {
        const [affectedRows] = await UserModel.update(
            { password: password },
            {
                where: {
                    uuid_user,
                    is_active: true
                }
            }
        );

        return affectedRows > 0;
    }

    async findConflictingEmail(email: string, excludeUuid?: string): Promise<UserModel | null> {
        const trimmed = email.trim();
        if (!trimmed) {
            return null;
        }

        const where: Record<string, unknown> = { email: trimmed };
        if (excludeUuid) {
            where.uuid_user = { [Op.ne]: excludeUuid };
        }

        return await UserModel.findOne({ where });
    }

    async findConflictingUsername(username: string, excludeUuid?: string): Promise<UserModel | null> {
        const trimmed = username.trim();
        if (!trimmed) {
            return null;
        }

        const where: Record<string, unknown> = { username: trimmed };
        if (excludeUuid) {
            where.uuid_user = { [Op.ne]: excludeUuid };
        }

        return await UserModel.findOne({ where });
    }

    async findConflictingIdCard(idCard: string, uuidCompany: string, excludeUuid?: string): Promise<UserModel | null> {
        const trimmed = idCard.trim();
        if (!trimmed || !uuidCompany) {
            return null;
        }

        const where: Record<string, unknown> = {
            id_card: trimmed,
            uuid_company: uuidCompany,
            is_active: true
        };
        if (excludeUuid) {
            where.uuid_user = { [Op.ne]: excludeUuid };
        }

        return await UserModel.findOne({ where });
    }
}

export default UserRepository;
