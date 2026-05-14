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
import {UserFieldAvailabilityResult} from "../interfaces/user/user-availability.interface";

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

    private getMaxUsersByPlan(planType: CompanyAttributes['plan_type']): number {
        const limitsByPlan: Record<string, number> = {
            ESSENTIAL: 20,
            PROFESSIONAL: 60,
            ENTERPRISE: 200,
            BASIC: 20,
            PREMIUM: 200
        };

        return limitsByPlan[planType] ?? 20;
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

        const company = companyResponse.data;
        const activeUsersInCompany = await UserModel.count({
            where: {
                uuid_company: userBody.uuid_company,
                is_active: true
            }
        });
        const maxUsersAllowed = this.getMaxUsersByPlan(company.plan_type);

        if (activeUsersInCompany >= maxUsersAllowed) {
            throw new ApiError({
                name: 'PlanLimitReached',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: `Plan ${company.plan_type} allows only ${maxUsersAllowed} active users`
            });
        }

        this.passwordValidatorService.validate(userBody.password);

        await this.assertUniqueUserFields({
                email: userBody.email,
                username: userBody.username,
                id_card: userBody.id_card,
                uuid_company: userBody.uuid_company
            });

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

        const existingResponse = await this.getById({
            id: uuid_user,
            includeInactive: false,
            uuid_company: tenantContext?.uuid_company
        });

        if (!existingResponse.success || !existingResponse.data) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'User not found'
            });
        }

        const existing = existingResponse.data;
        const merged = {
            email: userBody.email != null ? String(userBody.email) : existing.email,
            username: userBody.username != null ? String(userBody.username) : existing.username,
            id_card: userBody.id_card != null ? String(userBody.id_card) : existing.id_card,
            uuid_company: userBody.uuid_company ?? existing.uuid_company
        };

        await this.assertUniqueUserFields(merged, uuid_user);

        const updateData: UserCreationAttributes = { ...userBody };
        if (updateData.password !== undefined && updateData.password !== null) {
            const rawPassword = String(updateData.password).trim();
            if (rawPassword === '') {
                delete updateData.password;
            } else {
                this.passwordValidatorService.validate(rawPassword);
                updateData.password = await bcrypt.hash(rawPassword, 10);
            }
        }

        const updatedUser = await this.userRepository.update(uuid_user, updateData, tenantContext);

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

    async checkUserFieldAvailability(params: {
        email?: string;
        username?: string;
        id_card?: string;
        uuid_company: string;
        exclude_uuid_user?: string;
    }): Promise<ServiceResponse<UserFieldAvailabilityResult>> {
        const email = params.email?.trim();
        const username = params.username?.trim();
        const idCard = params.id_card?.trim();

        if (!email && !username && !idCard) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'At least one of email, username, or id_card is required'
            });
        }

        if (idCard && !params.uuid_company) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'uuid_company is required when checking id_card'
            });
        }

        const [emailHit, usernameHit, idCardHit] = await Promise.all([
            email ? this.userManagerRepository.findConflictingEmail(email, params.exclude_uuid_user) : Promise.resolve(null),
            username ? this.userManagerRepository.findConflictingUsername(username, params.exclude_uuid_user) : Promise.resolve(null),
            idCard && params.uuid_company
                ? this.userManagerRepository.findConflictingIdCard(idCard, params.uuid_company, params.exclude_uuid_user)
                : Promise.resolve(null)
        ]);

        return {
            success: true,
            data: {
                emailAvailable: email ? !emailHit : true,
                usernameAvailable: username ? !usernameHit : true,
                idCardAvailable: idCard ? !idCardHit : true
            }
        };
    }

    private async assertUniqueUserFields(
        fields: { email: string; username: string; id_card: string; uuid_company: string },
        excludeUuid?: string
    ): Promise<void> {
        const [emailHit, usernameHit, idCardHit] = await Promise.all([
            this.userManagerRepository.findConflictingEmail(fields.email, excludeUuid),
            this.userManagerRepository.findConflictingUsername(fields.username, excludeUuid),
            this.userManagerRepository.findConflictingIdCard(fields.id_card, fields.uuid_company, excludeUuid)
        ]);

        if (emailHit) {
            throw new ApiError({
                name: 'Conflict',
                statusCode: HttpStatusCodes.CONFLICT,
                description: 'EMAIL_IN_USE'
            });
        }

        if (usernameHit) {
            throw new ApiError({
                name: 'Conflict',
                statusCode: HttpStatusCodes.CONFLICT,
                description: 'USERNAME_IN_USE'
            });
        }

        if (idCardHit) {
            throw new ApiError({
                name: 'Conflict',
                statusCode: HttpStatusCodes.CONFLICT,
                description: 'ID_CARD_IN_USE'
            });
        }
    }
}

export default UserService;