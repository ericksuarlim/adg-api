import { ServiceResponse } from '../interfaces/common/service-response.interface';
import { ISessionService } from '../interfaces/services/session-service.interface';
import {SessionAttributes, SessionCreationAttributes} from "../interfaces/session/session.interface";
import {ISessionRepository} from "../interfaces/repositories/session-repository.interface";
import {Status} from "../interfaces/params/query.interface";
import SessionModel from "../database/models/session.model";

class SessionService implements ISessionService<SessionAttributes> {
    private sessionRepository: ISessionRepository<SessionModel, SessionCreationAttributes>;

    constructor(sessionRepository: ISessionRepository<SessionModel, SessionCreationAttributes>) {
        this.sessionRepository = sessionRepository;
    }

    async createSession(data: SessionCreationAttributes): Promise<ServiceResponse<SessionAttributes>> {
        try {
            const session = await this.sessionRepository.createSession(data);

            return { success: true, data: session };
        } catch (error) {
            return { success: false, error: 'Error creating session' };
        }
    }

    async logout(user_name: string): Promise<ServiceResponse<null>> {
        try {
            const response = await this.sessionRepository.logout(user_name);

            if (!response) {
                return {
                    success: false,
                    error: 'User not found or logout failed',
                    code: 404
                };
            }

            return { success: true, data: null };
        } catch (error) {
            return { success: false, error: 'Error during logout' };
        }
    }

    async getSessions(params: {
        page: number;
        size: number;
        sortBy: string;
        order: 'ASC' | 'DESC';
        status?: Status;
    }): Promise<ServiceResponse<SessionAttributes[]>> {
        try {
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
        } catch (error) {
            return { success: false, error: 'Error fetching sessions' };
        }
    }
}

export default SessionService;