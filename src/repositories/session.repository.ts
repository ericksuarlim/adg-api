import { Pool } from 'pg';
import database from "../config/database.config";
import { SessionData } from "../interfaces/session/session-data.interface";

class SessionRepository {
    private pool: Pool;

    constructor() {
        this.pool = new Pool(database);
    }

    async CreateSession(data: SessionData): Promise<SessionData> {
        const { user_name, user_token, active, login_date } = data;

        const result = await this.pool.query<SessionData>(
            `INSERT INTO public.session(user_name, user_token, active, login_date)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
                [user_name, user_token, active, login_date]
        );

        return result.rows[0];
    }

    async GetSessions(): Promise<SessionData[]> {
        const result = await this.pool.query<SessionData>(
            `SELECT * FROM public.session`
        );
        return result.rows;
    }

    async Logout(user_name: string): Promise<boolean> {
        const result = await this.pool.query<{ bool: boolean }>(
            `UPDATE public.session
       SET active = false, user_token = null
       WHERE user_name = $1
       RETURNING true`,
                [user_name]
        );

        return result.rows[0]?.bool ?? false;
    }

    async DeleteExpiredSession(): Promise<number | null> {
        const result = await this.pool.query(
            `DELETE FROM public.session
       WHERE login_date < now() - interval '28 days'`
        );

        return result.rowCount;
    }

    async ResetSession(): Promise<number | null> {
        const result = await this.pool.query(
            `UPDATE public.session
       SET user_token = null, active = false
       WHERE login_date < now() - interval '1 day'`
        );

        return result.rowCount;
    }
}

export default SessionRepository;
