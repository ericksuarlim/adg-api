export interface IAuthenticationDBRepository {
    validateUser(userName: string): Promise<boolean>;
    validatePassword(password: string, userName: string): Promise<boolean>;
    validateUserId(uuidUser: string): Promise<boolean>;
    validateCode(uuidUser: string, code: string): Promise<boolean>;
}