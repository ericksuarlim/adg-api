import { Pool } from 'pg';
import { databaseConfig } from "../config";
import { IAuthenticationDBRepository } from "../interfaces/repositories/authentication-repository.interface";

class AuthenticationRepository implements IAuthenticationDBRepository {
  private pool: Pool;

  constructor() {
    this.pool = new Pool(databaseConfig);
  }

  async ValidateUser(userName: string): Promise<boolean> {
    const result = await this.pool.query(
        'SELECT EXISTS(SELECT 1 FROM public."user" WHERE user_name = $1 AND is_active = true)',
        [userName]
    );
    return result.rows[0].exists;
  }

  async ValidatePassword(password: string, userName: string): Promise<boolean> {
    const result = await this.pool.query(
        'SELECT EXISTS(SELECT 1 FROM public."user" WHERE password = $1 AND user_name = $2)',
        [password, userName]
    );
    return result.rows[0].exists;
  }

  async ValidateUserId(uuidUser: string): Promise<boolean> {
    const result = await this.pool.query(
        'SELECT EXISTS(SELECT 1 FROM public."user" WHERE uuid_user = $1 AND enabled = true)',
        [uuidUser]
    );
    return result.rows[0].exists;
  }

  async ValidateCode(uuidUser: string, code: string): Promise<boolean> {
    const result = await this.pool.query(
        'SELECT EXISTS(SELECT 1 FROM public."user" WHERE uuid_user = $1 AND password_code = $2)',
        [uuidUser, code]
    );
    return result.rows[0].exists;
  }
}

export default AuthenticationRepository;
