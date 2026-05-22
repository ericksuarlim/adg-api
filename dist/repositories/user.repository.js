"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../database/models");
const login_credential_util_1 = require("../utils/login-credential.util");
const sequelize_1 = require("sequelize");
class UserRepository {
    async findAll(params) {
        const { page, size, sortBy, order, status } = params;
        const offset = (page - 1) * size;
        const baseWhere = {};
        if (status === 'active') {
            baseWhere.is_active = true;
        }
        else if (status === 'inactive') {
            baseWhere.is_active = false;
        }
        if (params.uuid_company) {
            baseWhere.uuid_company = params.uuid_company;
        }
        const searchTerm = params.search?.trim();
        const include = searchTerm
            ? [{
                    model: models_1.CompanyModel,
                    as: "company",
                    attributes: ["uuid_company", "name"],
                    required: false,
                }]
            : [];
        let where = baseWhere;
        if (searchTerm) {
            const pattern = `%${searchTerm}%`;
            where = {
                [sequelize_1.Op.and]: [
                    baseWhere,
                    {
                        [sequelize_1.Op.or]: [
                            { username: { [sequelize_1.Op.iLike]: pattern } },
                            { email: { [sequelize_1.Op.iLike]: pattern } },
                            { first_name: { [sequelize_1.Op.iLike]: pattern } },
                            { last_name: { [sequelize_1.Op.iLike]: pattern } },
                            { id_card: { [sequelize_1.Op.iLike]: pattern } },
                            { "$company.name$": { [sequelize_1.Op.iLike]: pattern } },
                        ],
                    },
                ],
            };
        }
        return await models_1.UserModel.findAndCountAll({
            where,
            include,
            offset,
            limit: size,
            order: [[sortBy, order]],
            distinct: Boolean(searchTerm),
            subQuery: false,
        });
    }
    async findById(params) {
        const { id, includeInactive, uuid_company } = params;
        const where = { uuid_user: id };
        if (!includeInactive) {
            where.is_active = true;
        }
        if (uuid_company) {
            where.uuid_company = uuid_company;
        }
        return await models_1.UserModel.findOne({
            where,
            include: [
                {
                    model: models_1.CompanyModel,
                    as: 'company',
                    attributes: ['uuid_company', 'name']
                }
            ]
        });
    }
    async create(data) {
        return await models_1.UserModel.create(data);
    }
    async update(uuid_user, data, options) {
        const where = { uuid_user, is_active: true };
        if (options?.uuid_company) {
            where.uuid_company = options.uuid_company;
        }
        const [count, updated] = await models_1.UserModel.update(data, {
            where,
            returning: true,
        });
        if (count === 0)
            return null;
        return updated[0];
    }
    async delete(uuid_user, options) {
        const where = { uuid_user, is_active: true };
        if (options?.uuid_company) {
            where.uuid_company = options.uuid_company;
        }
        const [count] = await models_1.UserModel.update({ is_active: false }, { where });
        return count > 0;
    }
    async manageUser(uuid_user) {
        const user = await models_1.UserModel.findOne({
            where: { uuid_user, is_active: true }
        });
        if (!user)
            return null;
        user.is_active = !user.is_active;
        await user.save();
        return user;
    }
    async findUserByName(username) {
        const trimmed = (0, login_credential_util_1.normalizeLoginCredential)(username);
        if (!trimmed) {
            return null;
        }
        const lowered = trimmed.toLowerCase();
        const user = await models_1.UserModel.findOne({
            where: {
                is_active: true,
                [sequelize_1.Op.or]: [
                    { username: trimmed },
                    { email: trimmed },
                    (0, sequelize_1.where)((0, sequelize_1.fn)("LOWER", (0, sequelize_1.fn)("TRIM", (0, sequelize_1.col)("username"))), sequelize_1.Op.eq, lowered),
                    (0, sequelize_1.where)((0, sequelize_1.fn)("LOWER", (0, sequelize_1.fn)("TRIM", (0, sequelize_1.col)("email"))), sequelize_1.Op.eq, lowered),
                ],
            }
        });
        return user ?? null;
    }
    async resetPassword(uuid_user, password) {
        const [affectedRows] = await models_1.UserModel.update({ password: password }, {
            where: {
                uuid_user,
                is_active: true
            }
        });
        return affectedRows > 0;
    }
    async findConflictingEmail(email, excludeUuid) {
        const trimmed = email.trim();
        if (!trimmed) {
            return null;
        }
        const where = { email: trimmed };
        if (excludeUuid) {
            where.uuid_user = { [sequelize_1.Op.ne]: excludeUuid };
        }
        return await models_1.UserModel.findOne({ where });
    }
    async findConflictingUsername(username, excludeUuid) {
        const trimmed = username.trim();
        if (!trimmed) {
            return null;
        }
        const where = { username: trimmed };
        if (excludeUuid) {
            where.uuid_user = { [sequelize_1.Op.ne]: excludeUuid };
        }
        return await models_1.UserModel.findOne({ where });
    }
    async findConflictingIdCard(idCard, uuidCompany, excludeUuid) {
        const trimmed = idCard.trim();
        if (!trimmed || !uuidCompany) {
            return null;
        }
        const where = {
            id_card: trimmed,
            uuid_company: uuidCompany,
            is_active: true
        };
        if (excludeUuid) {
            where.uuid_user = { [sequelize_1.Op.ne]: excludeUuid };
        }
        return await models_1.UserModel.findOne({ where });
    }
}
exports.default = UserRepository;
