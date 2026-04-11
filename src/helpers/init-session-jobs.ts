import schedule from 'node-schedule';
import { ISessionRepository } from '../interfaces/repositories/session-repository.interface';

export const initSessionJobs = (repository: ISessionRepository) => {

    schedule.scheduleJob('0 0 1 * *', async () => {
        await repository.deleteExpiredSession();
    });

    schedule.scheduleJob('0 0 * * *', async () => {
        await repository.resetSession();
    });

};