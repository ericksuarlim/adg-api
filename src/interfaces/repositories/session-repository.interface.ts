import {PaginatedResult} from "./base-repository.interface";
import {Status} from "../params/query.interface";

export interface ISessionRepository<T, C> {
    createSession(data: C): Promise<T>;
    logout(user_name: string): Promise<boolean>;
    logoutByToken(user_token: string): Promise<boolean>;
    findActiveSession(user_name: string): Promise<T | null>;
    isTokenSessionActive(user_name: string, user_token: string): Promise<boolean>;
    deactivateExpiredSessions(user_name?: string): Promise<number>;
    getSessions(params: {
        page: number;
        size: number;
        sortBy: string;
        order: 'ASC' | 'DESC';
        status?: Status;
    }): Promise<PaginatedResult<T>>;
    deleteExpiredSession(): Promise<boolean>;
    resetSession(): Promise<boolean>;
}
