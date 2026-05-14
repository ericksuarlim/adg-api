import { IMembershipService, MembershipTenantOptions } from "../interfaces/services/membership-service.interface";
import { IMembershipRepository } from "../interfaces/repositories/membership-repository.interface";
import { ServiceResponse } from "../interfaces/common/service-response.interface";
import ApiError from "../errors/apiError";
import HttpStatusCodes from "../errors/httpStatusCodes";
import {UserRanchModel} from "../database/models";
import {UserRanchAttributes, UserRanchCreationAttributes} from "../interfaces/ranch/user-ranch.interface";
import {IBaseParams} from "../interfaces/params/query.interface";
import {normalizeUserRole, UserRole, isValidAssignableRole} from "../interfaces/roles/roles.interface";
import {IBaseServiceInterface} from "../interfaces/services/base-service.interface";
import {UserAttributes, UserCreationAttributes} from "../interfaces/user/user.interface";
import {RanchAttributes, RanchCreationAttributes} from "../interfaces/ranch/ranch.interface";

/**
 * Membresías usuario ↔ rancho (`user_ranches`):
 * - Compañía: N ranchos, N usuarios.
 * - Administrador: puede tener varias membresías activas (N ranchos de esa compañía).
 * - `ranch_staff`: puede tener varias membresías en la misma compañía; el alcance operativo es por compañía
 *   (las restricciones son por permisos / rol, no por “un solo rancho”).
 */
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

    private isCrossTenantRequest(options?: MembershipTenantOptions): boolean {
        return Boolean(options?.allowCrossTenant);
    }

    private async resolveTenantCompanyForUser(
        uuid_user: string,
        jwtCompany: string,
        options?: MembershipTenantOptions
    ): Promise<string> {
        const userResponse = await this.userService.getById({
            id: uuid_user,
            includeInactive: false
        });

        if (!userResponse.success || !userResponse.data) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'User not found'
            });
        }

        const tenantCompany = userResponse.data.uuid_company;

        if (!this.isCrossTenantRequest(options) && tenantCompany !== jwtCompany) {
            throw new ApiError({
                name: 'Forbidden',
                statusCode: HttpStatusCodes.FORBIDDEN,
                description: 'Cannot manage users outside your company'
            });
        }

        return tenantCompany;
    }

    private async resolveTenantCompanyForRanch(
        uuid_ranch: string,
        jwtCompany: string,
        options?: MembershipTenantOptions
    ): Promise<string> {
        const ranchResponse = await this.ranchService.getById({
            id: uuid_ranch,
            includeInactive: false,
            uuid_company: this.isCrossTenantRequest(options) ? undefined : jwtCompany,
        });

        if (!ranchResponse.success || !ranchResponse.data) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Ranch not found'
            });
        }

        const tenantCompany = ranchResponse.data.uuid_company;

        if (!this.isCrossTenantRequest(options) && tenantCompany !== jwtCompany) {
            throw new ApiError({
                name: 'Forbidden',
                statusCode: HttpStatusCodes.FORBIDDEN,
                description: 'Cannot manage ranches outside your company'
            });
        }

        return tenantCompany;
    }

    async assignUserToRanch(
        data: UserRanchCreationAttributes,
        jwtCompany: string,
        options?: MembershipTenantOptions
    ): Promise<ServiceResponse<UserRanchAttributes>> {
        const { uuid_user, uuid_ranch, role } = data;
        const tenantCompany = await this.resolveTenantCompanyForUser(uuid_user, jwtCompany, options);
        await this.validateUserAndRanch(uuid_user, uuid_ranch, tenantCompany);

        const normalizedRole = normalizeUserRole(String(role));
        if (!normalizedRole || !isValidAssignableRole(normalizedRole)) {
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

        const membership =
            existing && !existing.is_active
                ? await this.membershipRepository.upsertActiveMembership(uuid_user, uuid_ranch, normalizedRole)
                : await this.membershipRepository.create({
                      ...data,
                      role: normalizedRole,
                      is_active: true,
                  });

        if (normalizedRole === UserRole.ADMINISTRATOR) {
            await this.syncAdministratorMembershipsAcrossCompany(uuid_user, tenantCompany);
        }

        return {
            success: true,
            data: membership.get({ plain: true })
        };
    }

    async changeRole(
        uuid_user: string,
        uuid_ranch: string,
        role: UserRole,
        jwtCompany: string,
        options?: MembershipTenantOptions
    ): Promise<ServiceResponse<UserRanchAttributes>> {
        const tenantCompany = await this.resolveTenantCompanyForUser(uuid_user, jwtCompany, options);
        await this.validateUserAndRanch(uuid_user, uuid_ranch, tenantCompany);

        const normalizedRole = normalizeUserRole(String(role));
        if (!normalizedRole || !isValidAssignableRole(normalizedRole)) {
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

        if (normalizedRole === UserRole.ADMINISTRATOR) {
            await this.syncAdministratorMembershipsAcrossCompany(uuid_user, tenantCompany);
        }

        return {
            success: true,
            data: updated.get({ plain: true })
        };
    }

    async removeUserFromRanch(
        uuid_user: string,
        uuid_ranch: string,
        jwtCompany: string,
        options?: MembershipTenantOptions
    ): Promise<ServiceResponse<null>> {
        if (!uuid_user || !uuid_ranch) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'uuid_user and uuid_ranch are required'
            });
        }

        const tenantCompany = await this.resolveTenantCompanyForUser(uuid_user, jwtCompany, options);
        await this.validateUserAndRanch(uuid_user, uuid_ranch, tenantCompany);

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
        jwtCompany: string,
        options?: MembershipTenantOptions
    ): Promise<ServiceResponse<UserRanchAttributes[]>> {
        if (!uuid_ranch) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'uuid_user and uuid_ranch are required'
            });
        }

        const tenantCompany = await this.resolveTenantCompanyForRanch(uuid_ranch, jwtCompany, options);
        await this.ranchService.getById({ id: uuid_ranch, includeInactive: false, uuid_company: tenantCompany });

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
        jwtCompany: string,
        options?: MembershipTenantOptions
    ): Promise<ServiceResponse<UserRanchAttributes[]>> {
        if (!uuid_user) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'uuid_user and uuid_ranch are required'
            });
        }

        const tenantCompany = await this.resolveTenantCompanyForUser(uuid_user, jwtCompany, options);
        await this.userService.getById({ id: uuid_user, includeInactive: false, uuid_company: tenantCompany });

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

    /**
     * Cuando un usuario pasa a ser administrador en un rancho, asegura fila activa de administrador
     * en el resto de ranchos activos de la misma empresa donde no tenga ya una membresía activa
     * (no modifica roles activos distintos, p. ej. ranch_staff en otro rancho).
     */
    private async syncAdministratorMembershipsAcrossCompany(uuid_user: string, uuid_company: string): Promise<void> {
        const ranchResponse = await this.ranchService.getAll({
            page: 1,
            size: 500,
            sortBy: 'createdAt',
            order: 'ASC',
            status: 'active',
            uuid_company,
        });

        if (!ranchResponse.success || !ranchResponse.data?.length) {
            return;
        }

        for (const ranch of ranchResponse.data) {
            if (ranch.uuid_company !== uuid_company) {
                continue;
            }
            const row = await this.membershipRepository.findMembership(uuid_user, ranch.uuid_ranch);
            if (row?.is_active) {
                continue;
            }
            await this.membershipRepository.upsertActiveMembership(uuid_user, ranch.uuid_ranch, UserRole.ADMINISTRATOR);
        }
    }

    /**
     * Sets the user as an active administrator on every active ranch in their company.
     * Used when the client should not depend on a selected ranch (e.g. SaaS creating a company administrator).
     */
    async promoteUserToCompanyAdministrator(
        uuid_user: string,
        jwtCompany: string,
        options?: MembershipTenantOptions
    ): Promise<ServiceResponse<null>> {
        if (!uuid_user?.trim()) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'uuid_user is required',
            });
        }
        const tenantCompany = await this.resolveTenantCompanyForUser(uuid_user, jwtCompany, options);
        const ranchResponse = await this.ranchService.getAll({
            page: 1,
            size: 500,
            sortBy: 'createdAt',
            order: 'ASC',
            status: 'active',
            uuid_company: tenantCompany,
        });

        if (!ranchResponse.success || !ranchResponse.data?.length) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Company has no active ranches; cannot assign a company administrator',
            });
        }

        for (const ranch of ranchResponse.data) {
            if (ranch.uuid_company !== tenantCompany) {
                continue;
            }
            await this.membershipRepository.upsertActiveMembership(uuid_user, ranch.uuid_ranch, UserRole.ADMINISTRATOR);
        }

        return {
            success: true,
            data: null,
        };
    }

    async syncCompanyAdministratorsToNewRanch(
        uuid_ranch: string,
        jwtCompany: string,
        options?: MembershipTenantOptions
    ): Promise<void> {
        const tenantCompany = await this.resolveTenantCompanyForRanch(uuid_ranch, jwtCompany, options);
        const adminUserIds = await this.membershipRepository.findUserIdsWithActiveAdministratorInCompany(tenantCompany);
        for (const uid of adminUserIds) {
            await this.membershipRepository.upsertActiveMembership(uid, uuid_ranch, UserRole.ADMINISTRATOR);
        }
    }
}

export default MembershipService;