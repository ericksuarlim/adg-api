import { UserAttributes, UserCreationAttributes } from "../interfaces/user/user.interface";
import { ServiceResponse } from "../interfaces/common/service-response.interface";
import { IBaseServiceInterface } from "../interfaces/services/base-service.interface";
import { IUserManagerRepository } from "../interfaces/repositories/user-repository.interface";
import { IBaseRepository } from "../interfaces/repositories/base-repository.interface";
import ApiError from "../errors/apiError";
import HttpStatusCodes from "../errors/httpStatusCodes";
import bcrypt from "bcryptjs";
import {UserModel} from "../database/models";
import {IUserManagerServiceInterface} from "../interfaces/services/user-service.interface";
import {CompanyAttributes, CompanyCreationAttributes} from "../interfaces/company/company.interface";
import {IPasswordValidatorService} from "../interfaces/services/password-validator-service.interface";
import {IBaseParams} from "../interfaces/params/query.interface";

class UserService implements
    IBaseServiceInterface<UserAttributes, UserCreationAttributes>,
    IUserManagerServiceInterface<UserAttributes> {

    private readonly userRepository: IBaseRepository<UserModel, UserCreationAttributes>;
    private readonly userManagerRepository: IUserManagerRepository<UserModel>;
    private readonly companyService: IBaseServiceInterface<CompanyAttributes, CompanyCreationAttributes>;
    private readonly passwordValidatorService: IPasswordValidatorService;

    constructor(
        userRepository: IBaseRepository<UserModel, UserCreationAttributes>,
        userManagerRepository: IUserManagerRepository<UserModel>,
        companyService: IBaseServiceInterface<CompanyAttributes, CompanyCreationAttributes>,
        passwordValidatorService: IPasswordValidatorService
    ) {
        this.userRepository = userRepository;
        this.userManagerRepository = userManagerRepository;
        this.companyService = companyService;
        this.passwordValidatorService = passwordValidatorService;
    }

    async getAll(params: IBaseParams): Promise<ServiceResponse<UserAttributes[]>> {
        const {rows, count} = await this.userRepository.findAll(params);

        const plainUsers = rows.map(user => user.get({plain: true}));

        return {
            success: true,
            data: plainUsers,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / params.size),
                currentPage: params.page,
                order: params.order,
                pageSize: params.size
            }
        };
    }

    async create(userBody: UserCreationAttributes): Promise<ServiceResponse<UserAttributes>> {
        if (!userBody.password) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Password is required'
            });
        }

        const companyResponse = await this.companyService.getById({ id: userBody.uuid_company });

        if (!companyResponse.success) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Company does not exist'
            });
        }

        this.passwordValidatorService.validate(userBody.password);

        const hashedPassword = await bcrypt.hash(userBody.password, 10);

        const user = await this.userRepository.create({
            ...userBody,
            password: hashedPassword
        });

        return {
            success: true,
            data: user.get({ plain: true })
        };
    }

    async getById(params: { id: string, includeInactive?: boolean, uuid_company?: string }): Promise<ServiceResponse<UserAttributes>> {
        const { id:uuid_user, includeInactive, uuid_company } = params;

        if (!uuid_user) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'uuid_user is required'
            });
        }

        const user = await this.userRepository.findById({id: uuid_user, includeInactive, uuid_company});

        if (!user) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'User not found'
            });
        }

        return {
            success: true,
            data: user.get({ plain: true })
        };
    }

    async update(
        uuid_user: string,
        userBody: UserCreationAttributes,
        tenantContext?: { uuid_company?: string }
    ): Promise<ServiceResponse<UserAttributes>> {
        if (!uuid_user || uuid_user.trim() === '') {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Username is required'
            });
        }

        const updatedUser = await this.userRepository.update(uuid_user, userBody, tenantContext);

        if (!updatedUser) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'User not found or inactive'
            });
        }

        return {
            success: true,
            data: updatedUser.get({ plain: true })
        };
    }

    async delete(uuid_user: string, tenantContext?: { uuid_company?: string }): Promise<ServiceResponse<null>> {
        if (!uuid_user || uuid_user.trim() === '') {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Username is required'
            });
        }

        const deleted = await this.userRepository.delete(uuid_user, tenantContext);

        if (!deleted) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'User not found or already inactive'
            });
        }

        return {
            success: true,
            data: null
        };
    }

    async manageUser(uuid_user: string): Promise<ServiceResponse<UserAttributes>> {
        if (!uuid_user || uuid_user.trim() === '') {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Username is required'
            });
        }

        const user = await this.userManagerRepository.manageUser(uuid_user);

        if (!user) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'User not found'
            });
        }

        return {
            success: true,
            data: user.get({ plain: true })
        };
    }

    async getUserByName(username: string): Promise<ServiceResponse<UserAttributes>> {

        if (!username || username.trim() === "") {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Username is required'
            });
        }

        const user = await this.userManagerRepository.findUserByName(username);

        if (!user) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'User not found'
            });
        }

        return {
            success: true,
            data: user.get({ plain: true })
        };
    }

    async resetPassword(uuid_user: string, password: string): Promise<ServiceResponse<null>> {
        if (!uuid_user || uuid_user.trim() === '') {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'User Id required'
            });
        }

        if (!password || password.trim() === '') {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Password is required'
            });
        }

        this.passwordValidatorService.validate(password);

        const hashedPassword = await bcrypt.hash(password, 10);
        const passwordReset = await this.userManagerRepository.resetPassword(uuid_user, hashedPassword);
        if (!passwordReset) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Company not found or already inactive'
            });
        }

        return {
            success: true,
            data: null,
        }
    }
}

export default UserService;