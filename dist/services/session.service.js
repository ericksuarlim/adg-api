"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SessionService {
    constructor(sessionRepository) {
        this.sessionRepository = sessionRepository;
    }
    async createSession(data) {
        const session = await this.sessionRepository.createSession(data);
        return { success: true, data: session };
    }
    async logout(user_name) {
        const response = await this.sessionRepository.logout(user_name);
        if (!response) {
            return {
                success: false,
                error: 'User not found or logout failed',
                code: 404
            };
        }
        return { success: true, data: null };
    }
    async logoutByToken(user_token) {
        const response = await this.sessionRepository.logoutByToken(user_token);
        if (!response) {
            return {
                success: false,
                error: 'Session token not found',
                code: 404
            };
        }
        return { success: true, data: null };
    }
    async hasActiveSession(user_name) {
        const session = await this.sessionRepository.findActiveSession(user_name);
        return Boolean(session);
    }
    async isTokenSessionActive(user_name, user_token) {
        return await this.sessionRepository.isTokenSessionActive(user_name, user_token);
    }
    async deactivateExpiredSessions(user_name) {
        return await this.sessionRepository.deactivateExpiredSessions(user_name);
    }
    async getSessions(params) {
        const { rows, count } = await this.sessionRepository.getSessions(params);
        const plainSessions = rows.map(session => session.get({ plain: true }));
        return {
            success: true,
            data: plainSessions,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / params.size),
                currentPage: params.page,
                order: params.order,
                pageSize: params.size
            }
        };
    }
}
exports.default = SessionService;
