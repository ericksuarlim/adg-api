"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const login_credential_util_1 = require("../utils/login-credential.util");
const models_1 = require("../database/models");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const sequelize_1 = require("sequelize");
class AuthenticationRepository {
    async findActiveUserForLogin(credential) {
        const trimmed = (0, login_credential_util_1.normalizeLoginCredential)(credential);
        if (!trimmed) {
            return null;
        }
        /**
         * Coincidencia por usuario o email, sin distinguir mayúsculas/minúsculas (PostgreSQL ILIKE).
         * Evita expresiones anidadas fn/col que en algunos casos no generaban SQL equivalente al LOWER(TRIM(...)).
         */
        return await models_1.UserModel.findOne({
            where: {
                is_active: true,
                [sequelize_1.Op.or]: [
                    { username: { [sequelize_1.Op.iLike]: trimmed } },
                    { email: { [sequelize_1.Op.iLike]: trimmed } },
                ],
            },
        });
    }
    async validateUser(userName) {
        const user = await this.findActiveUserForLogin(userName);
        return !!user;
    }
    async validatePassword(password, userName) {
        const user = await this.findActiveUserForLogin(userName);
        if (!user)
            return false;
        return await bcryptjs_1.default.compare(password, user.password);
    }
    async validateUserId(uuidUser) {
        const user = await models_1.UserModel.findOne({
            where: {
                uuid_user: uuidUser,
                is_active: true,
            },
        });
        return !!user;
    }
    async validateCode(uuidUser, code) {
        void uuidUser;
        void code;
        return true;
    }
}
exports.default = AuthenticationRepository;
