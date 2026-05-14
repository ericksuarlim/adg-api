"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const session_model_1 = __importDefault(require("../database/models/session.model"));
class SessionRepository {
    constructor() {
        this.MILLISECONDS_IN_SECOND = 1000;
        this.SECONDS_IN_MINUTE = 60;
        this.MINUTES_IN_HOUR = 60;
        this.SESSION_MAX_HOURS = 15;
        this.HOURS_TO_RESET = 1;
        this.MILLISECONDS_IN_HOUR = this.MINUTES_IN_HOUR * this.SECONDS_IN_MINUTE * this.MILLISECONDS_IN_SECOND;
        this.SESSION_EXPIRATION_TIME = this.SESSION_MAX_HOURS * this.MILLISECONDS_IN_HOUR;
        this.SESSION_RESET_TIME = this.HOURS_TO_RESET * this.MILLISECONDS_IN_HOUR;
        this.getPastDate = (milliseconds) => {
            return new Date(Date.now() - milliseconds);
        };
    }
    async createSession(data) {
        return await session_model_1.default.create(data);
    }
    async getSessions(params) {
        const { page, size, sortBy, order, status } = params;
        const offset = (page - 1) * size;
        const where = {};
        if (status === 'active') {
            where.is_active = true;
        }
        else if (status === 'inactive') {
            where.is_active = false;
        }
        return await session_model_1.default.findAndCountAll({
            where,
            offset,
            limit: size,
            order: [[sortBy, order]],
        });
    }
    async logout(user_name) {
        const [affectedRows] = await session_model_1.default.update({
            is_active: false,
            user_token: '',
        }, {
            where: { user_name },
        });
        return affectedRows > 0;
    }
    async logoutByToken(user_token) {
        const [affectedRows] = await session_model_1.default.update({
            is_active: false,
            user_token: '',
        }, {
            where: { user_token, is_active: true },
        });
        return affectedRows > 0;
    }
    async findActiveSession(user_name) {
        await this.deactivateExpiredSessions(user_name);
        return await session_model_1.default.findOne({
            where: {
                user_name,
                is_active: true,
                login_date: {
                    [sequelize_1.Op.gte]: this.getPastDate(this.SESSION_EXPIRATION_TIME),
                },
            },
            order: [['login_date', 'DESC']],
        });
    }
    async isTokenSessionActive(user_name, user_token) {
        await this.deactivateExpiredSessions(user_name);
        const session = await session_model_1.default.findOne({
            where: {
                user_name,
                user_token,
                is_active: true,
                login_date: {
                    [sequelize_1.Op.gte]: this.getPastDate(this.SESSION_EXPIRATION_TIME),
                },
            },
        });
        return Boolean(session);
    }
    async deactivateExpiredSessions(user_name) {
        const where = {
            is_active: true,
            login_date: {
                [sequelize_1.Op.lt]: this.getPastDate(this.SESSION_EXPIRATION_TIME),
            },
        };
        if (user_name) {
            where.user_name = user_name;
        }
        const [affectedRows] = await session_model_1.default.update({
            user_token: '',
            is_active: false,
        }, { where });
        return affectedRows;
    }
    async deleteExpiredSession() {
        const count = await this.deactivateExpiredSessions();
        return count > 0;
    }
    async resetSession() {
        const [affectedRows] = await session_model_1.default.update({
            user_token: '',
            is_active: false,
        }, {
            where: {
                login_date: {
                    [sequelize_1.Op.lt]: this.getPastDate(this.SESSION_RESET_TIME),
                },
            },
        });
        return affectedRows > 0;
    }
}
exports.default = SessionRepository;
