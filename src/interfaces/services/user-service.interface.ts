import { ServiceResponse } from "../common/service-response.interface";

export interface IUserManagerServiceInterface<T> {
    manageUser(uuid_user: string): Promise<ServiceResponse<T | null>>;
    getUserByName(user_name: string): Promise<ServiceResponse<T | null>>;
    resetPassword(uuid_user: string, password: string): Promise<ServiceResponse<null>>
}
