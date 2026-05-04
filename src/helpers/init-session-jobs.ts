import schedule from 'node-schedule';
import { ISessionRepository } from '../interfaces/repositories/session-repository.interface';
import {SessionAttributes, SessionCreationAttributes} from "../interfaces/session/session.interface";

export const initSessionJobs = (repository: ISessionRepository<SessionAttributes, SessionCreationAttributes>) => {

    schedule.scheduleJob('0 0 1 * *', async () => {
        await repository.deleteExpiredSession();
    });

    schedule.scheduleJob('0 0 * * *', async () => {
        await repository.resetSession();
    });

};