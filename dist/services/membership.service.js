"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apiError_1 = __importDefault(require("../errors/apiError"));
const httpStatusCodes_1 = __importDefault(require("../errors/httpStatusCodes"));
const roles_interface_1 = require("../interfaces/roles/roles.interface");
/**
 * Company-scoped membership: roles live on `users.role`. Staff and administrators
 * operate on any ranch in the company; endpoints that still carry `uuid_ranch` echo it for clients.
 */
class MembershipService {
    constructor(userService, ranchService) {
        this.userService = userService;
        this.ranchService = ranchService;
    }
    isCrossTenantRequest(options) {
        return Boolean(options?.allowCrossTenant);
    }
    async resolveTenantCompanyForUser(uuid_user, jwtCompany, options) {
        const userResponse = await this.userService.getById({
            id: uuid_user,
            includeInactive: false,
        });
        if (!userResponse.success || !userResponse.data) {
            throw new apiError_1.default({
                name: "NotFound",
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
                description: "User not found",
            });
        }
        const tenantCompany = userResponse.data.uuid_company;
        if (!this.isCrossTenantRequest(options) && tenantCompany !== jwtCompany) {
            throw new apiError_1.default({
                name: "Forbidden",
                statusCode: httpStatusCodes_1.default.FORBIDDEN,
                description: "Cannot manage users outside your company",
            });
        }
        return tenantCompany;
    }
    async resolveTenantCompanyForRanch(uuid_ranch, jwtCompany, options) {
        const ranchResponse = await this.ranchService.getById({
            id: uuid_ranch,
            includeInactive: false,
            uuid_company: this.isCrossTenantRequest(options) ? undefined : jwtCompany,
        });
        if (!ranchResponse.success || !ranchResponse.data) {
            throw new apiError_1.default({
                name: "NotFound",
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
                description: "Ranch not found",
            });
        }
        const tenantCompany = ranchResponse.data.uuid_company;
        if (!this.isCrossTenantRequest(options) && tenantCompany !== jwtCompany) {
            throw new apiError_1.default({
                name: "Forbidden",
                statusCode: httpStatusCodes_1.default.FORBIDDEN,
                description: "Cannot manage ranches outside your company",
            });
        }
        return tenantCompany;
    }
    assertAssignableRole(role) {
        if (role === roles_interface_1.UserRole.SAAS_OWNER) {
            throw new apiError_1.default({
                name: "ValidationError",
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: "saas_owner cannot be assigned via membership API",
            });
        }
        if (!(0, roles_interface_1.isValidAssignableRole)(role)) {
            throw new apiError_1.default({
                name: "ValidationError",
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: `Role '${role}' is not valid`,
            });
        }
    }
    toMembershipRow(uuid_ranch, uuid_company, user) {
        const role = (0, roles_interface_1.normalizeUserRole)(String(user.role)) ?? roles_interface_1.UserRole.RANCH_STAFF;
        return {
            user_ranch_id: 0,
            uuid_user: user.uuid_user,
            uuid_ranch,
            uuid_company,
            role,
            is_active: user.is_active,
        };
    }
    async resolveEchoRanchUuid(tenantCompany, _jwtCompany, _options, explicit) {
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
    async assignCompanyRole(data, jwtCompany, options) {
        const { uuid_user, role } = data;
        const tenantCompany = await this.resolveTenantCompanyForUser(uuid_user, jwtCompany, options);
        const normalizedRole = (0, roles_interface_1.normalizeUserRole)(String(role));
        if (!normalizedRole) {
            throw new apiError_1.default({
                name: "ValidationError",
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: `Role '${role}' is not valid`,
            });
        }
        this.assertAssignableRole(normalizedRole);
        if (!this.isCrossTenantRequest(options) && normalizedRole === roles_interface_1.UserRole.ADMINISTRATOR) {
            throw new apiError_1.default({
                name: "Forbidden",
                statusCode: httpStatusCodes_1.default.FORBIDDEN,
                description: "Only a SaaS owner can grant the company administrator role",
            });
        }
        const updated = await this.userService.update(uuid_user, { role: normalizedRole }, {
            uuid_company: tenantCompany,
            creatorRoles: options?.actorRoles,
        });
        if (!updated.success || !updated.data) {
            throw new apiError_1.default({
                name: "NotFound",
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
                description: "User not found or inactive",
            });
        }
        const echoRanch = await this.resolveEchoRanchUuid(tenantCompany, jwtCompany, options, data.uuid_ranch);
        return {
            success: true,
            data: this.toMembershipRow(echoRanch, tenantCompany, updated.data),
        };
    }
    async changeCompanyUserRole(uuid_user, role, jwtCompany, options) {
        const tenantCompany = await this.resolveTenantCompanyForUser(uuid_user, jwtCompany, options);
        const normalizedRole = (0, roles_interface_1.normalizeUserRole)(String(role));
        if (!normalizedRole) {
            throw new apiError_1.default({
                name: "ValidationError",
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: `Role '${role}' is not valid`,
            });
        }
        this.assertAssignableRole(normalizedRole);
        if (!this.isCrossTenantRequest(options) && normalizedRole === roles_interface_1.UserRole.ADMINISTRATOR) {
            throw new apiError_1.default({
                name: "Forbidden",
                statusCode: httpStatusCodes_1.default.FORBIDDEN,
                description: "Only a SaaS owner can grant the company administrator role",
            });
        }
        const updated = await this.userService.update(uuid_user, { role: normalizedRole }, {
            uuid_company: tenantCompany,
            creatorRoles: options?.actorRoles,
        });
        if (!updated.success || !updated.data) {
            throw new apiError_1.default({
                name: "NotFound",
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
                description: "Problem changing role",
            });
        }
        const echoRanch = await this.resolveEchoRanchUuid(tenantCompany, jwtCompany, options, null);
        return {
            success: true,
            data: this.toMembershipRow(echoRanch, tenantCompany, updated.data),
        };
    }
    async removeUserFromCompany(uuid_user, jwtCompany, options) {
        if (!uuid_user) {
            throw new apiError_1.default({
                name: "ValidationError",
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: "uuid_user is required",
            });
        }
        const tenantCompany = await this.resolveTenantCompanyForUser(uuid_user, jwtCompany, options);
        const removed = await this.userService.delete(uuid_user, {
            uuid_company: tenantCompany,
            requestingUuidUser: options?.requestingUuidUser,
        });
        if (!removed.success) {
            throw new apiError_1.default({
                name: "NotFound",
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
                description: "User not found or already inactive",
            });
        }
        return {
            success: true,
            data: null,
        };
    }
    async getUsersByRanch(uuid_ranch, params, jwtCompany, options) {
        if (!uuid_ranch) {
            throw new apiError_1.default({
                name: "ValidationError",
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
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
    async getRanchesByUser(uuid_user, params, jwtCompany, options) {
        if (!uuid_user) {
            throw new apiError_1.default({
                name: "ValidationError",
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
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
            throw new apiError_1.default({
                name: "NotFound",
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
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
    async promoteUserToCompanyAdministrator(uuid_user, jwtCompany, options) {
        if (!uuid_user?.trim()) {
            throw new apiError_1.default({
                name: "ValidationError",
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: "uuid_user is required",
            });
        }
        const tenantCompany = await this.resolveTenantCompanyForUser(uuid_user, jwtCompany, options);
        const updated = await this.userService.update(uuid_user, { role: roles_interface_1.UserRole.ADMINISTRATOR }, {
            uuid_company: tenantCompany,
            creatorRoles: options?.actorRoles,
            skipRoleAssignmentPolicy: true,
        });
        if (!updated.success || !updated.data) {
            throw new apiError_1.default({
                name: "NotFound",
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
                description: "User not found or inactive",
            });
        }
        return {
            success: true,
            data: null,
        };
    }
    async userListPage(params) {
        const response = await this.userService.getAll(params);
        if (!response.success || !response.data) {
            return { rows: [], count: 0 };
        }
        const count = response.pagination?.totalItems ?? response.data.length;
        return { rows: response.data, count };
    }
}
exports.default = MembershipService;
