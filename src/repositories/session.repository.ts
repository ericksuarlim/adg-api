import { Op } from "sequelize";
import { ISessionRepository } from "../interfaces/repositories/session-repository.interface";
import { SessionCreationAttributes } from "../interfaces/session/session.interface";
import {Status} from "../interfaces/params/query.interface";
import SessionModel from "../database/models/session.model";

class SessionRepository implements ISessionRepository<SessionModel, SessionCreationAttributes> {
    private MILLISECONDS_IN_SECOND = 1000;
    private SECONDS_IN_MINUTE = 60;
    private MINUTES_IN_HOUR = 60;
    private HOURS_IN_DAY = 24;
    private MILLISECONDS_IN_DAY =
        this.HOURS_IN_DAY * this.MINUTES_IN_HOUR * this.SECONDS_IN_MINUTE * this.MILLISECONDS_IN_SECOND;

    private DAYS_TO_EXPIRE = 28;
    private DAYS_TO_RESET = 1;

    private SESSION_EXPIRATION_TIME = this.DAYS_TO_EXPIRE * this.MILLISECONDS_IN_DAY;
    private SESSION_RESET_TIME = this.DAYS_TO_RESET * this.MILLISECONDS_IN_DAY;

    async createSession(data: SessionCreationAttributes): Promise<SessionModel> {
        return await SessionModel.create(data);
    }

    async getSessions(params: {
        page: number;
        size: number;
        sortBy: string;
        order: 'ASC' | 'DESC';
        status?: Status;
    }): Promise<{rows: SessionModel[], count: number}> {
        const { page, size, sortBy, order, status } = params;
        const offset = (page - 1) * size;

        const where: any = {};

        if (status === 'active') {
            where.is_active = true;
        } else if (status === 'inactive') {
            where.is_active = false;
        }

        return await SessionModel.findAndCountAll({
            where,
            offset,
            limit: size,
            order: [[sortBy, order]],
        });
    }

    async logout(user_name: string): Promise<boolean> {
        const [affectedRows] = await SessionModel.update(
            {
                is_active: false,
                user_token: null,
            },
            {
                where: { user_name },
            }
        );

        return affectedRows > 0;
    }

    async deleteExpiredSession(): Promise<boolean> {
        const count = await SessionModel.destroy({
            where: {
                login_date: {
                    [Op.lt]: this.getPastDate(this.SESSION_EXPIRATION_TIME),
                },
            },
        });

        return count > 0;
    }

    async resetSession(): Promise<boolean> {
        const [affectedRows] = await SessionModel.update(
            {
                user_token: null,
                is_active: false,
            },
            {
                where: {
                    login_date: {
                        [Op.lt]: this.getPastDate(this.SESSION_RESET_TIME),
                    },
                },
            }
        );

        return affectedRows > 0;
    }

    private getPastDate = (days: number): Date => {
        return new Date(Date.now() - days * this.MILLISECONDS_IN_DAY);
    };
}

export default SessionRepository;