import {Pool} from 'pg';
import {UserAttributes} from "../interfaces/user/user.interface";
import database from "../config/database.config";
import {ServiceResponse} from "../interfaces/common/service-response.interface";

class UserRepository {
    private pool: Pool;

    constructor() {
        this.pool = new Pool(database);
    }

    async ManageUser(uuid_user: string): Promise<ServiceResponse<UserAttributes>> {
        const result = await this.pool.query<UserAttributes>(
            `UPDATE public.user
             SET enabled = NOT enabled
             WHERE uuid_user = $1 RETURNING *`,
            [uuid_user]
        );

        if (result.rows.length === 0) {
            return {success: false, error: 'User not found', code: 404};
        }

        return {success: true, data: result.rows[0]};
    }
}

export default UserRepository;
