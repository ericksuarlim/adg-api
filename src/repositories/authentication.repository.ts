import { IAuthenticationDBRepository } from "../interfaces/repositories/authentication-repository.interface";
import { normalizeLoginCredential } from "../utils/login-credential.util";
import { UserModel } from "../database/models";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";

class AuthenticationRepository implements IAuthenticationDBRepository {
  async findActiveUserForLogin(credential: string): Promise<UserModel | null> {
    const trimmed = normalizeLoginCredential(credential);
    if (!trimmed) {
      return null;
    }

    /**
     * Coincidencia por usuario o email, sin distinguir mayúsculas/minúsculas (PostgreSQL ILIKE).
     * Evita expresiones anidadas fn/col que en algunos casos no generaban SQL equivalente al LOWER(TRIM(...)).
     */
    return await UserModel.findOne({
      where: {
        is_active: true,
        [Op.or]: [
          { username: { [Op.iLike]: trimmed } },
          { email: { [Op.iLike]: trimmed } },
        ],
      },
    });
  }

  async validateUser(userName: string): Promise<boolean> {
    const user = await this.findActiveUserForLogin(userName);
    return !!user;
  }

  async validatePassword(password: string, userName: string): Promise<boolean> {
    const user = await this.findActiveUserForLogin(userName);
    if (!user) return false;

    return await bcrypt.compare(password, user.password);
  }

  async validateUserId(uuidUser: string): Promise<boolean> {
    const user = await UserModel.findOne({
      where: {
        uuid_user: uuidUser,
        is_active: true,
      },
    });

    return !!user;
  }

  async validateCode(uuidUser: string, code: string): Promise<boolean> {
    void uuidUser;
    void code;
    return true;
  }
}

export default AuthenticationRepository;
