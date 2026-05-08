import { IAuthenticationDBRepository } from "../interfaces/repositories/authentication-repository.interface";
import {UserModel} from "../database/models";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";

class AuthenticationRepository implements IAuthenticationDBRepository {

  async validateUser(userName: string): Promise<boolean> {
    const user = await UserModel.findOne({
      where: {
        [Op.or]: [{ username: userName }, { email: userName }],
        is_active: true,
      },
    });

    return !!user;
  }

  async validatePassword(password: string, userName: string): Promise<boolean> {
    const user = await UserModel.findOne({
      where: {
        [Op.or]: [{ username: userName }, { email: userName }],
        is_active: true
      },
    });

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
    return true
  }
}

export default AuthenticationRepository;
