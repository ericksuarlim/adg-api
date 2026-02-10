import UserRepository from '../repositories/user.repository';
import {UserAttributes, UserCreationAttributes} from "../interfaces/user/user.interface";
import {ServiceResponse} from "../interfaces/common/service-response.interface";
import {
    ICreateService, IDeleteService,
    IGetAllService,
    IGetService,
    IUpdateService
} from "../interfaces/services/base-service.interface";
import {IUserByNameService, IUserManageService} from "../interfaces/services/user-service.interface";

class UserService implements
    IGetAllService<UserAttributes>,
    IGetService<UserAttributes>,
    ICreateService<UserAttributes, UserCreationAttributes>,
    IUpdateService<UserAttributes, UserCreationAttributes>,
    IDeleteService,
    IUserManageService,
    IUserByNameService {

    private repository: UserRepository;
    private userModel: any;

    constructor(UserModel: any) {
        this.repository = new UserRepository();
        this.userModel = UserModel;
    }

    async getAll(
        params: { page: number; size: number; sortBy: string; order: 'ASC' | 'DESC' }
    ): Promise<ServiceResponse<UserAttributes[]>> {
        const { page, size, sortBy, order } = params;

        const offset = (page - 1) * size;
        const limit = size;

        const result = await this.userModel.findAndCountAll({
            offset,
            limit,
            order: [[sortBy, order]],
        });

        const totalPages = Math.ceil(result.count / size);

        const plainRows: UserAttributes[] = result.rows.map((user: any) =>
            user.toJSON?.() ?? user
        );

        return {
            success: true,
            data: plainRows,
            pagination: {
                totalItems: result.count,
                totalPages,
                currentPage: page,
            },
        } as ServiceResponse<UserAttributes[]>;
    }


    async create(userBody: UserCreationAttributes): Promise<ServiceResponse<UserAttributes>> {
        const user = await this.userModel.create(userBody);

        return { success: true, data: user };
    }

    async getById(uuid_user: string): Promise<ServiceResponse<UserAttributes | null>> {
        const user = await this.userModel.findByPk(uuid_user);
        if (!user) return { success: false, error: 'User not found', code: 404 };

        return { success: true, data: user };
    }

    async delete(uuid_user: string): Promise<ServiceResponse<null>> {
        const user = await this.userModel.findByPk(uuid_user);
        if (!user) return { success: false, error: 'User not found', code: 404 };

        await user.destroy();

        return { success: true, data: null };
    }

    async update(uuid_user: string, userBody: UserCreationAttributes): Promise<ServiceResponse<UserAttributes | null>> {
        const [count, updatedUser] = await this.userModel.update(userBody, {
            where: { uuid_user },
            returning: true,
            plain: true,
        });

        if (count === 0) return { success: false, error: 'User not found', code: 404 };

        return { success: true, data: updatedUser };
    }

    async manageUser(uuid_user: string): Promise<ServiceResponse<UserAttributes | null>> {
        return await this.repository.ManageUser(uuid_user);
    }

    async getUserByName(user_name: string): Promise<ServiceResponse<UserAttributes | null>>  {
        const user = await this.userModel.findOne({ where: { user_name } });
        if (!user) return { success: false, error: 'User not found', code: 404 };

        return { success: true, data: user };
    }
}

export default UserService;
