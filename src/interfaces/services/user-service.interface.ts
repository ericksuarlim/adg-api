import { ServiceResponse } from "../common/service-response.interface";
import { UserAttributes } from "../user/user.interface";

export interface IUserManageService {
    manageUser(uuid_user: string): Promise<ServiceResponse<UserAttributes | null>>;
}

export interface IUserByNameService {
    getUserByName(user_name: string): Promise<ServiceResponse<UserAttributes | null>>;
}
