import { ServiceResponse } from '../common/service-response.interface';
import {SessionCreationAttributes} from "../session/session.interface";
import {Status} from "../params/query.interface";

export interface ISessionService<T> {
    createSession(data: SessionCreationAttributes): Promise<ServiceResponse<T>>;
    logout(user_name: string): Promise<ServiceResponse<null>>;
    getSessions(params: {
        page: number;
        size: number;
        sortBy: string;
        order: 'ASC' | 'DESC';
        status?: Status;
    }): Promise<ServiceResponse<T[]>>;
}
