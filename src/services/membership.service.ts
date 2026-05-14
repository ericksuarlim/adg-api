import {
    CompanyMembershipAssignBody,
    IMembershipService,
    MembershipTenantOptions,
} from "../interfaces/services/membership-service.interface";
import { ServiceResponse } from "../interfaces/common/service-response.interface";
import ApiError from "../errors/apiError";
import HttpStatusCodes from "../errors/httpStatusCodes";
import { UserRanchAttributes } from "../interfaces/ranch/user-ranch.interface";
import { IBaseParams } from "../interfaces/params/query.interface";
import { normalizeUserRole, UserRole, isValidAssignableRole } from "../interfaces/roles/roles.interface";
import { IBaseServiceInterface } from "../interfaces/services/base-service.interface";
import { UserAttributes, UserCreationAttributes } from "../interfaces/user/user.interface";
import { RanchAttributes, RanchCreationAttributes } from "../interfaces/ranch/ranch.interface";
import UserService from "./user.services";

/**
 * Company-scoped membership: roles live on `users.role`. Staff and administrators
 * operate on any ranch in the company; endpoints that still carry `uuid_ranch` echo it for clients.
 */
class MembershipService implements IMembershipService {
    private readonly userService: UserService;
    private readonly ranchService: IBaseServiceInterface<RanchAttributes, RanchCreationAttributes>;

    constructor(
        userService: UserService,
        ranchService: IBaseServiceInterface<RanchAttributes, RanchCreationAttributes>
    ) {
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
            includeInactive: false,
        });

        if (!userResponse.success || !userResponse.data) {
            throw new ApiError({
                name: "NotFound",
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: "User not found",
            });
        }

        const tenantCompany = userResponse.data.uuid_company;

        if (!this.isCrossTenantRequest(options) && tenantCompany !== jwtCompany) {
            throw new ApiError({
                name: "Forbidden",
                statusCode: HttpStatusCodes.FORBIDDEN,
                description: "Cannot manage users outside your company",
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
                name: "NotFound",
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: "Ranch not found",
            });
        }

        const tenantCompany = ranchResponse.data.uuid_company;

        if (!this.isCrossTenantRequest(options) && tenantCompany !== jwtCompany) {
            throw new ApiError({
                name: "Forbidden",
                statusCode: HttpStatusCodes.FORBIDDEN,
                description: "Cannot manage ranches outside your company",
            });
        }

        return tenantCompany;
    }

    private assertAssignableRole(role: UserRole): void {
        if (role === UserRole.SAAS_OWNER) {
            throw new ApiError({
                name: "ValidationError",
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: "saas_owner cannot be assigned via membership API",
            });
        }
        if (!isValidAssignableRole(role)) {
            throw new ApiError({
                name: "ValidationError",
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: `Role '${role}' is not valid`,
            });
        }
    }

    private toMembershipRow(
        uuid_ranch: string,
        uuid_company: string,
        user: UserAttributes
    ): UserRanchAttributes {
        const role = normalizeUserRole(String(user.role)) ?? UserRole.RANCH_STAFF;
        return {
            user_ranch_id: 0,
            uuid_user: user.uuid_user,
            uuid_ranch,
            uuid_company,
            role,
            is_active: user.is_active,
        };
    }

    private async resolveEchoRanchUuid(
        tenantCompany: string,
        _jwtCompany: string,
        _options: MembershipTenantOptions | undefined,
        explicit?: string | null
    ): Promise<string> {
        const trimmed = explicit?.trim();
        if (trimmed) {
            return trimmed;
        }
        const ranchResponse = await this.ranchService.getAll({
            page: 1,
            size: 1,
            sortBy: "createdAt",
            order: "ASC",
            status: "active",
            uuid_company: tenantCompany,
        });
        const first = ranchResponse.data?.[0];
        if (first?.uuid_ranch) {
            return first.uuid_ranch;
        }
        /**
         * Sin ranchos aún (p. ej. tras crear la compañía o pagar antes de provisionar ranchos):
         * se devuelve `uuid_company` como eco para no romper respuestas de membresía; el cliente no debe
         * tratarlo como UUID de rancho real hasta que exista al menos un rancho.
         */
        return tenantCompany;
    }

    async assignCompanyRole(
        data: CompanyMembershipAssignBody,
        jwtCompany: string,
        options?: MembershipTenantOptions
    ): Promise<ServiceResponse<UserRanchAttributes>> {
        const { uuid_user, role } = data;
        const tenantCompany = await this.resolveTenantCompanyForUser(uuid_user, jwtCompany, options);
        const normalizedRole = normalizeUserRole(String(role));
        if (!normalizedRole) {
            throw new ApiError({
                name: "ValidationError",
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: `Role '${role}' is not valid`,
            });
        }
        this.assertAssignableRole(normalizedRole);

        if (!this.isCrossTenantRequest(options) && normalizedRole === UserRole.ADMINISTRATOR) {
            throw new ApiError({
                name: "Forbidden",
                statusCode: HttpStatusCodes.FORBIDDEN,
                description: "Only a SaaS owner can grant the company administrator role",
            });
        }

        const updated = await this.userService.update(
            uuid_user,
            { role: normalizedRole } as UserCreationAttributes,
            {
                uuid_company: tenantCompany,
                creatorRoles: options?.actorRoles,
            }
        );

        if (!updated.success || !updated.data) {
            throw new ApiError({
                name: "NotFound",
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: "User not found or inactive",
            });
        }

        const echoRanch = await this.resolveEchoRanchUuid(tenantCompany, jwtCompany, options, data.uuid_ranch);

        return {
            success: true,
            data: this.toMembershipRow(echoRanch, tenantCompany, updated.data),
        };
    }

    async changeCompanyUserRole(
        uuid_user: string,
        role: UserRole,
        jwtCompany: string,
        options?: MembershipTenantOptions
    ): Promise<ServiceResponse<UserRanchAttributes>> {
        const tenantCompany = await this.resolveTenantCompanyForUser(uuid_user, jwtCompany, options);
        const normalizedRole = normalizeUserRole(String(role));
        if (!normalizedRole) {
            throw new ApiError({
                name: "ValidationError",
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: `Role '${role}' is not valid`,
            });
        }
        this.assertAssignableRole(normalizedRole);

        if (!this.isCrossTenantRequest(options) && normalizedRole === UserRole.ADMINISTRATOR) {
            throw new ApiError({
                name: "Forbidden",
                statusCode: HttpStatusCodes.FORBIDDEN,
                description: "Only a SaaS owner can grant the company administrator role",
            });
        }

        const updated = await this.userService.update(
            uuid_user,
            { role: normalizedRole } as UserCreationAttributes,
            {
                uuid_company: tenantCompany,
                creatorRoles: options?.actorRoles,
            }
        );

        if (!updated.success || !updated.data) {
            throw new ApiError({
                name: "NotFound",
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: "Problem changing role",
            });
        }

        const echoRanch = await this.resolveEchoRanchUuid(tenantCompany, jwtCompany, options, null);

        return {
            success: true,
            data: this.toMembershipRow(echoRanch, tenantCompany, updated.data),
        };
    }

    async removeUserFromCompany(
        uuid_user: string,
        jwtCompany: string,
        options?: MembershipTenantOptions
    ): Promise<ServiceResponse<null>> {
        if (!uuid_user) {
            throw new ApiError({
                name: "ValidationError",
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: "uuid_user is required",
            });
        }

        const tenantCompany = await this.resolveTenantCompanyForUser(uuid_user, jwtCompany, options);
        const removed = await this.userService.delete(uuid_user, { uuid_company: tenantCompany });

        if (!removed.success) {
            throw new ApiError({
                name: "NotFound",
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: "User not found or already inactive",
            });
        }

        return {
            success: true,
            data: null,
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
                name: "ValidationError",
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: "uuid_ranch is required",
            });
        }

        const tenantCompany = await this.resolveTenantCompanyForRanch(uuid_ranch, jwtCompany, options);
        await this.ranchService.getById({
            id: uuid_ranch,
            includeInactive: false,
            uuid_company: tenantCompany,
        });

        const scopedParams = { ...params, uuid_company: tenantCompany };
        const { rows, count } = await this.userListPage(scopedParams);

        const plains = rows.map((u) => this.toMembershipRow(uuid_ranch, tenantCompany, u));

        return {
            success: true,
            data: plains,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / params.size),
                currentPage: params.page,
                order: params.order,
                pageSize: params.size,
            },
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
                name: "ValidationError",
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: "uuid_user is required",
            });
        }

        const tenantCompany = await this.resolveTenantCompanyForUser(uuid_user, jwtCompany, options);
        const userResponse = await this.userService.getById({
            id: uuid_user,
            includeInactive: false,
            uuid_company: tenantCompany,
        });

        if (!userResponse.success || !userResponse.data) {
            throw new ApiError({
                name: "NotFound",
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: "User not found",
            });
        }

        const user = userResponse.data;
        const ranchResponse = await this.ranchService.getAll({
            ...params,
            uuid_company: tenantCompany,
            status: "active",
        });

        if (!ranchResponse.success || !ranchResponse.data) {
            return {
                success: true,
                data: [],
                pagination: {
                    totalItems: 0,
                    totalPages: 0,
                    currentPage: params.page,
                    order: params.order,
                    pageSize: params.size,
                },
            };
        }

        const count = ranchResponse.pagination?.totalItems ?? ranchResponse.data.length;
        const plains = ranchResponse.data.map((ranch) => this.toMembershipRow(ranch.uuid_ranch, tenantCompany, user));

        return {
            success: true,
            data: plains,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / params.size),
                currentPage: params.page,
                order: params.order,
                pageSize: params.size,
            },
        };
    }

    async promoteUserToCompanyAdministrator(
        uuid_user: string,
        jwtCompany: string,
        options?: MembershipTenantOptions
    ): Promise<ServiceResponse<null>> {
        if (!uuid_user?.trim()) {
            throw new ApiError({
                name: "ValidationError",
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: "uuid_user is required",
            });
        }
        const tenantCompany = await this.resolveTenantCompanyForUser(uuid_user, jwtCompany, options);
        const updated = await this.userService.update(
            uuid_user,
            { role: UserRole.ADMINISTRATOR } as UserCreationAttributes,
            {
                uuid_company: tenantCompany,
                creatorRoles: options?.actorRoles,
                skipRoleAssignmentPolicy: true,
            }
        );

        if (!updated.success || !updated.data) {
            throw new ApiError({
                name: "NotFound",
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: "User not found or inactive",
            });
        }

        return {
            success: true,
            data: null,
        };
    }

    private async userListPage(
        params: IBaseParams & { uuid_company: string }
    ): Promise<{ rows: UserAttributes[]; count: number }> {
        const response = await this.userService.getAll(params);
        if (!response.success || !response.data) {
            return { rows: [], count: 0 };
        }
        const count = response.pagination?.totalItems ?? response.data.length;
        return { rows: response.data, count };
    }
}

export default MembershipService;
