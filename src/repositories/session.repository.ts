import { Op } from "sequelize";
import { ISessionRepository } from "../interfaces/repositories/session-repository.interface";
import { SessionCreationAttributes } from "../interfaces/session/session.interface";
import {Status} from "../interfaces/params/query.interface";
import SessionModel from "../database/models/session.model";

class SessionRepository implements ISessionRepository<SessionModel, SessionCreationAttributes> {
    private readonly MILLISECONDS_IN_SECOND = 1000;
    private readonly SECONDS_IN_MINUTE = 60;
    private readonly MINUTES_IN_HOUR = 60;
    private readonly SESSION_MAX_HOURS = 15;
    private readonly HOURS_TO_RESET = 1;
    private readonly MILLISECONDS_IN_HOUR =
        this.MINUTES_IN_HOUR * this.SECONDS_IN_MINUTE * this.MILLISECONDS_IN_SECOND;
    private readonly SESSION_EXPIRATION_TIME = this.SESSION_MAX_HOURS * this.MILLISECONDS_IN_HOUR;
    private readonly SESSION_RESET_TIME = this.HOURS_TO_RESET * this.MILLISECONDS_IN_HOUR;

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
                user_token: '',
            },
            {
                where: { user_name },
            }
        );

        return affectedRows > 0;
    }

    async logoutByToken(user_token: string): Promise<boolean> {
        const [affectedRows] = await SessionModel.update(
            {
                is_active: false,
                user_token: '',
            },
            {
                where: { user_token, is_active: true },
            }
        );

        return affectedRows > 0;
    }

    async findActiveSession(user_name: string): Promise<SessionModel | null> {
        await this.deactivateExpiredSessions(user_name);

        return await SessionModel.findOne({
            where: {
                user_name,
                is_active: true,
                login_date: {
                    [Op.gte]: this.getPastDate(this.SESSION_EXPIRATION_TIME),
                },
            },
            order: [['login_date', 'DESC']],
        });
    }

    async isTokenSessionActive(user_name: string, user_token: string): Promise<boolean> {
        await this.deactivateExpiredSessions(user_name);

        const session = await SessionModel.findOne({
            where: {
                user_name,
                user_token,
                is_active: true,
                login_date: {
                    [Op.gte]: this.getPastDate(this.SESSION_EXPIRATION_TIME),
                },
            },
        });

        return Boolean(session);
    }

    async deactivateExpiredSessions(user_name?: string): Promise<number> {
        const where: any = {
            is_active: true,
            login_date: {
                [Op.lt]: this.getPastDate(this.SESSION_EXPIRATION_TIME),
            },
        };
        if (user_name) {
            where.user_name = user_name;
        }

        const [affectedRows] = await SessionModel.update(
            {
                user_token: '',
                is_active: false,
            },
            { where }
        );

        return affectedRows;
    }

    async deleteExpiredSession(): Promise<boolean> {
        const count = await this.deactivateExpiredSessions();

        return count > 0;
    }

    async resetSession(): Promise<boolean> {
        const [affectedRows] = await SessionModel.update(
            {
                user_token: '',
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

    private readonly getPastDate = (milliseconds: number): Date => {
        return new Date(Date.now() - milliseconds);
    };
}

export default SessionRepository;