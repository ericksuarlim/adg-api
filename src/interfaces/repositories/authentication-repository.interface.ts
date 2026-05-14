import UserModel from "../../database/models/user.model";

export interface IAuthenticationDBRepository {
    validateUser(userName: string): Promise<boolean>;
    validatePassword(password: string, userName: string): Promise<boolean>;
    findActiveUserForLogin(credential: string): Promise<UserModel | null>;
    validateUserId(uuidUser: string): Promise<boolean>;
    validateCode(uuidUser: string, code: string): Promise<boolean>;
}