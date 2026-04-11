import {SessionData} from "../session/session-data.interface";
import {PaginatedResult} from "./base-repository.interface";
import {Status} from "../params/query.interface";

export interface ISessionRepository<T, C> {
    createSession(data: C): Promise<T>;
    logout(user_name: string): Promise<boolean>;
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
