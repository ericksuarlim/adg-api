import { ServiceResponse } from '../common/service-response.interface';
import { LoginData, LogoutData, ResetPasswordData } from '../authentication/authentication-data.interface';

export interface IAuthenticationService {
    login(data: LoginData): Promise<ServiceResponse<any>>;
    logout(data: LogoutData): Promise<ServiceResponse<null>>;
    requestNewPassword(): Promise<ServiceResponse<null>>;
    resetPassword(data: ResetPasswordData): Promise<ServiceResponse<null>>;
}
