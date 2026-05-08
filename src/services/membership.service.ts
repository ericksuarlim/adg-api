import { IMembershipService } from "../interfaces/services/membership-service.interface";
import { IMembershipRepository } from "../interfaces/repositories/membership-repository.interface";
import { ServiceResponse } from "../interfaces/common/service-response.interface";
import ApiError from "../errors/apiError";
import HttpStatusCodes from "../errors/httpStatusCodes";
import {UserRanchModel} from "../database/models";
import {UserRanchAttributes, UserRanchCreationAttributes} from "../interfaces/ranch/user-ranch.interface";
import {IBaseParams} from "../interfaces/params/query.interface";
import {normalizeUserRole, UserRole} from "../interfaces/roles/roles.interface";
import {isValidRole} from "../utils/globals-utils";
import {IBaseServiceInterface} from "../interfaces/services/base-service.interface";
import {UserAttributes, UserCreationAttributes} from "../interfaces/user/user.interface";
import {RanchAttributes, RanchCreationAttributes} from "../interfaces/ranch/ranch.interface";

class MembershipService implements IMembershipService<UserRanchAttributes, UserRanchCreationAttributes> {
    private readonly membershipRepository: IMembershipRepository<UserRanchModel, UserRanchCreationAttributes>;
    private readonly userService: IBaseServiceInterface<UserAttributes, UserCreationAttributes>;
    private readonly ranchService: IBaseServiceInterface<RanchAttributes, RanchCreationAttributes>;

    constructor(
        membershipRepository: IMembershipRepository<UserRanchModel, UserRanchCreationAttributes>,
        userService: IBaseServiceInterface<UserAttributes, UserCreationAttributes>,
        ranchService: IBaseServiceInterface<RanchAttributes, RanchCreationAttributes>
    ) {
        this.membershipRepository = membershipRepository;
        this.userService = userService;
        this.ranchService = ranchService;
    }

    async assignUserToRanch(data: UserRanchCreationAttributes, uuid_company: string): Promise<ServiceResponse<UserRanchAttributes>> {
        const { uuid_user, uuid_ranch, role } = data;
        await this.validateUserAndRanch(uuid_user, uuid_ranch, uuid_company);

        if (!isValidRole(role)) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: `Role '${role}' is not valid`
            });
        }

        const normalizedRole = normalizeUserRole(role);
        if (!normalizedRole) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: `Role '${role}' is not valid`
            });
        }

        const existing = await this.membershipRepository.findMembership(uuid_user, uuid_ranch);

        if (existing?.is_active) {
            throw new ApiError({
                name: 'Conflict',
                statusCode: HttpStatusCodes.CONFLICT,
                description: 'User already assigned to this ranch'
            });
        }

        const membership = await this.membershipRepository.create({
            ...data,
            role: normalizedRole
        });

        return {
            success: true,
            data: membership.get({ plain: true })
        };
    }

    async changeRole(
        uuid_user: string,
        uuid_ranch: string,
        role: UserRole,
        uuid_company: string
    ): Promise<ServiceResponse<UserRanchAttributes>> {
        await this.validateUserAndRanch(uuid_user, uuid_ranch, uuid_company);

        if (!isValidRole(role)) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: `Role '${role}' is not valid`
            });
        }

        const normalizedRole = normalizeUserRole(role);
        if (!normalizedRole) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: `Role '${role}' is not valid`
            });
        }

        const updated = await this.membershipRepository.updateRole(uuid_user, uuid_ranch, normalizedRole);

        if (!updated) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Problem changing role'
            });
        }

        return {
            success: true,
            data: updated.get({ plain: true })
        };
    }

    async removeUserFromRanch(uuid_user: string, uuid_ranch: string, uuid_company: string): Promise<ServiceResponse<null>> {
        if (!uuid_user || !uuid_ranch) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'uuid_user and uuid_ranch are required'
            });
        }

        await this.validateUserAndRanch(uuid_user, uuid_ranch, uuid_company);

        const removed = await this.membershipRepository.remove(uuid_user, uuid_ranch);

        if (!removed) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Membership not found or already inactive'
            });
        }

        return {
            success: true,
            data: null
        };
    }

    async getUsersByRanch(
        uuid_ranch: string,
        params: IBaseParams,
        uuid_company: string
    ): Promise<ServiceResponse<UserRanchAttributes[]>> {
        if (!uuid_ranch) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'uuid_user and uuid_ranch are required'
            });
        }

        await this.ranchService.getById({ id: uuid_ranch, includeInactive: false, uuid_company });

        const {rows, count} = await this.membershipRepository.findUsersByRanch(uuid_ranch, params);

        const plainsUsers = rows.map(userRanch => userRanch.get({plain: true}));

        return {
            success: true,
            data: plainsUsers,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / params.size),
                currentPage: params.page,
                order: params.order,
                pageSize: params.size
            }
        };
    }

    async getRanchesByUser(
        uuid_user: string,
        params: IBaseParams,
        uuid_company: string
    ): Promise<ServiceResponse<UserRanchAttributes[]>> {
        if (!uuid_user) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'uuid_user and uuid_ranch are required'
            });
        }

        await this.userService.getById({ id: uuid_user, includeInactive: false, uuid_company });

        const {rows, count} = await this.membershipRepository.findRanchesByUser(uuid_user, params);

        const plainsRanches = rows.map(userRanch => userRanch.get({plain: true}));

        return {
            success: true,
            data: plainsRanches,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / params.size),
                currentPage: params.page,
                order: params.order,
                pageSize: params.size
            }
        };
    }

    private async validateUserAndRanch(uuid_user: string, uuid_ranch: string, uuid_company: string) {
        if (!uuid_user || !uuid_ranch) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'uuid_user and uuid_ranch are required'
            });
        }

        const userResponse = await this.userService.getById({
            id: uuid_user,
            includeInactive: false,
            uuid_company
        });

        if (!userResponse.success || !userResponse.data) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'User not found'
            });
        }

        const ranchResponse = await this.ranchService.getById({
            id: uuid_ranch,
            includeInactive: false,
            uuid_company
        });

        if (!ranchResponse.success || !ranchResponse.data) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Ranch not found'
            });
        }

        const user = userResponse.data;
        const ranch = ranchResponse.data;

        if (user.uuid_company !== ranch.uuid_company) {
            throw new ApiError({
                name: 'Forbidden',
                statusCode: HttpStatusCodes.FORBIDDEN,
                description: 'User and Ranch belong to different companies'
            });
        }

        return { user, ranch };
    }
}

export default MembershipService;