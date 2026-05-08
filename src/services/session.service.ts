import { ServiceResponse } from '../interfaces/common/service-response.interface';
import { ISessionService } from '../interfaces/services/session-service.interface';
import {SessionAttributes, SessionCreationAttributes} from "../interfaces/session/session.interface";
import {ISessionRepository} from "../interfaces/repositories/session-repository.interface";
import {Status} from "../interfaces/params/query.interface";
import SessionModel from "../database/models/session.model";

class SessionService implements ISessionService<SessionAttributes> {
    private readonly sessionRepository: ISessionRepository<SessionModel, SessionCreationAttributes>;

    constructor(sessionRepository: ISessionRepository<SessionModel, SessionCreationAttributes>) {
        this.sessionRepository = sessionRepository;
    }

    async createSession(data: SessionCreationAttributes): Promise<ServiceResponse<SessionAttributes>> {
        const session = await this.sessionRepository.createSession(data);
        return { success: true, data: session };
    }

    async logout(user_name: string): Promise<ServiceResponse<null>> {
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

    async logoutByToken(user_token: string): Promise<ServiceResponse<null>> {
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

    async hasActiveSession(user_name: string): Promise<boolean> {
        const session = await this.sessionRepository.findActiveSession(user_name);
        return Boolean(session);
    }

    async isTokenSessionActive(user_name: string, user_token: string): Promise<boolean> {
        return await this.sessionRepository.isTokenSessionActive(user_name, user_token);
    }

    async deactivateExpiredSessions(user_name?: string): Promise<number> {
        return await this.sessionRepository.deactivateExpiredSessions(user_name);
    }

    async getSessions(params: {
        page: number;
        size: number;
        sortBy: string;
        order: 'ASC' | 'DESC';
        status?: Status;
    }): Promise<ServiceResponse<SessionAttributes[]>> {
        const {rows, count} = await this.sessionRepository.getSessions(params);
        const plainSessions = rows.map(session => session.get({plain: true}));

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

export default SessionService;