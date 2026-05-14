import { Request, Response, NextFunction } from "express";
import {
    CompanyMembershipAssignBody,
    IMembershipService,
    MembershipTenantOptions,
} from "../interfaces/services/membership-service.interface";
import { IGetMembershipByRanchParams, IGetMembershipByUserParams } from "../interfaces/params/membershipParams.interface";
import { buildGetAllParams } from "../utils/query.builder";
import { AuthRequest } from "../interfaces/middleware/auth-middleware.interface";
import { normalizeUserRole, normalizeUserRoles, UserRole } from "../interfaces/roles/roles.interface";
import ApiError from "../errors/apiError";
import HttpStatusCodes from "../errors/httpStatusCodes";

interface ICompanyUserMembershipParams {
    uuid_user: string;
}

class MembershipController {
    private readonly membershipService: IMembershipService;

    constructor(membershipService: IMembershipService) {
        this.membershipService = membershipService;
    }

    private membershipOptions(req: AuthRequest): MembershipTenantOptions {
        const roles = (req.user?.roles ?? []) as string[];
        return {
            allowCrossTenant: roles.includes(UserRole.SAAS_OWNER),
            actorRoles: normalizeUserRoles(roles),
        };
    }

    assign = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const response = await this.membershipService.assignCompanyRole(
                req.body as CompanyMembershipAssignBody,
                req.user?.uuid_company as string,
                this.membershipOptions(req)
            );

            return res.status(201).json(response);
        } catch (error) {
            next(error);
        }
    };

    promoteCompanyAdministrator = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const roles = (req.user?.roles ?? []) as string[];
            if (!roles.includes(UserRole.SAAS_OWNER)) {
                throw new ApiError({
                    name: "Forbidden",
                    statusCode: HttpStatusCodes.FORBIDDEN,
                    description: "Only a SaaS owner can promote a company administrator",
                });
            }
            const { uuid_user } = req.body as { uuid_user?: string };
            const response = await this.membershipService.promoteUserToCompanyAdministrator(
                uuid_user as string,
                req.user?.uuid_company as string,
                this.membershipOptions(req)
            );

            return res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };

    changeRole = async (
        req: AuthRequest & Request<ICompanyUserMembershipParams>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { uuid_user } = req.params;
            const { role } = req.body as { role?: UserRole };
            const normalized = normalizeUserRole(String(role ?? ""));
            if (!normalized) {
                throw new ApiError({
                    name: "ValidationError",
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    description: "role is required",
                });
            }
            const response = await this.membershipService.changeCompanyUserRole(
                uuid_user,
                normalized,
                req.user?.uuid_company as string,
                this.membershipOptions(req)
            );

            return res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };

    remove = async (req: AuthRequest & Request<ICompanyUserMembershipParams>, res: Response, next: NextFunction) => {
        try {
            const { uuid_user } = req.params;

            const response = await this.membershipService.removeUserFromCompany(
                uuid_user,
                req.user?.uuid_company as string,
                this.membershipOptions(req)
            );

            return res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };

    getUsersByRanch = async (req: AuthRequest & Request<IGetMembershipByRanchParams>, res: Response, next: NextFunction) => {
        try {
            const { uuid_ranch } = req.params;
            const params = buildGetAllParams(req.query);

            const response = await this.membershipService.getUsersByRanch(
                uuid_ranch,
                params,
                req.user?.uuid_company as string,
                this.membershipOptions(req)
            );

            return res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };

    getRanchesByUser = async (req: AuthRequest & Request<IGetMembershipByUserParams>, res: Response, next: NextFunction) => {
        try {
            const { uuid_user } = req.params;
            const params = buildGetAllParams(req.query);

            const response = await this.membershipService.getRanchesByUser(
                uuid_user,
                params,
                req.user?.uuid_company as string,
                this.membershipOptions(req)
            );

            return res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };
}

export default MembershipController;
