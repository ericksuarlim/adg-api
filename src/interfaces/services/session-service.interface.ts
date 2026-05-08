import { ServiceResponse } from '../common/service-response.interface';
import {SessionCreationAttributes} from "../session/session.interface";
import {Status} from "../params/query.interface";

export interface ISessionService<T> {
    createSession(data: SessionCreationAttributes): Promise<ServiceResponse<T>>;
    logout(user_name: string): Promise<ServiceResponse<null>>;
    logoutByToken(user_token: string): Promise<ServiceResponse<null>>;
    hasActiveSession(user_name: string): Promise<boolean>;
    isTokenSessionActive(user_name: string, user_token: string): Promise<boolean>;
    deactivateExpiredSessions(user_name?: string): Promise<number>;
    getSessions(params: {
        page: number;
        size: number;
        sortBy: string;
        order: 'ASC' | 'DESC';
        status?: Status;
    }): Promise<ServiceResponse<T[]>>;
}
