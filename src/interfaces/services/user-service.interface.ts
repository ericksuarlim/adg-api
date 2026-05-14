import { ServiceResponse } from "../common/service-response.interface";
import { UserFieldAvailabilityResult } from "../user/user-availability.interface";

export interface IUserManagerServiceInterface<T> {
    manageUser(uuid_user: string): Promise<ServiceResponse<T | null>>;
    getUserByName(user_name: string): Promise<ServiceResponse<T | null>>;
    resetPassword(uuid_user: string, password: string): Promise<ServiceResponse<null>>;
    checkUserFieldAvailability(params: {
        email?: string;
        username?: string;
        id_card?: string;
        uuid_company: string;
        exclude_uuid_user?: string;
    }): Promise<ServiceResponse<UserFieldAvailabilityResult>>;
}
