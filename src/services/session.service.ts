import schedule, { Job } from 'node-schedule';
import SessionRepository from '../repositories/session.repository';
import { ServiceResponse } from '../interfaces/common/service-response.interface';
import { SessionData } from '../interfaces/session/session-data.interface';
import { ISessionService } from '../interfaces/services/session-service.interface';

class SessionService implements ISessionService {
    private repository: SessionRepository;
    private sessionModel: any;
    private deleteJob: schedule.Job;
    private resetJob: schedule.Job;

    constructor(SessionModel: any) {
        this.repository = new SessionRepository();
        this.sessionModel = SessionModel;

        this.deleteJob = schedule.scheduleJob('0 0 1 * *', this.deleteExpiredSession.bind(this));
        this.resetJob = schedule.scheduleJob('0 0 * * *', this.resetSession.bind(this));
    }

    private async deleteExpiredSession() {
        await this.repository.DeleteExpiredSession();
    }

    private async resetSession() {
        await this.repository.ResetSession();
    }

    async createSession(data: SessionData): Promise<ServiceResponse<any>> {
        const session = await this.repository.CreateSession(data);
        return { success: true, data: session };
    }

    async logout(user_name: string): Promise<ServiceResponse<null>> {
        const response = await this.repository.Logout(user_name);
        if (!response) return { success: false, error: 'User not found or logout failed', code: 404 };
        return { success: true, data: null };
    }

    async getSessions(): Promise<ServiceResponse<SessionData[]>> {
        const sessions = await this.repository.GetSessions();
        return { success: true, data: sessions };
    }
}

export default SessionService;
