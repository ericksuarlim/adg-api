export interface IAuthenticationDBRepository {
    ValidateUser(userName: string): Promise<boolean>;
    ValidatePassword(password: string, userName: string): Promise<boolean>;
    ValidateUserId(uuidUser: string): Promise<boolean>;
    ValidateCode(uuidUser: string, code: string): Promise<boolean>;
}