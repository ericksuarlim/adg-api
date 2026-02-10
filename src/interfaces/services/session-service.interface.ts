import { ServiceResponse } from '../common/service-response.interface';
import { SessionData } from '../session-data.interface';

export interface ISessionService {
    createSession(data: SessionData): Promise<ServiceResponse<any>>;
    logout(user_name: string): Promise<ServiceResponse<null>>;
    getSessions(): Promise<ServiceResponse<SessionData[]>>;
}
