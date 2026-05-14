import { Request, Response, NextFunction } from "express";
import { IMembershipService, MembershipTenantOptions } from "../interfaces/services/membership-service.interface";
import {UserRanchAttributes, UserRanchCreationAttributes} from "../interfaces/ranch/user-ranch.interface";
import {
    IGetMembershipByRanchParams,
    IGetMembershipByUserParams,
    IGetRoleMembershipParams,
    IRemoveRoleMembershipParams
} from "../interfaces/params/membershipParams.interface";
import {buildGetAllParams} from "../utils/query.builder";
import { AuthRequest } from "../interfaces/middleware/auth-middleware.interface";
import { normalizeUserRoles, UserRole } from "../interfaces/roles/roles.interface";

class MembershipController {
    private readonly membershipService: IMembershipService<UserRanchAttributes, UserRanchCreationAttributes>;

    constructor(membershipService: IMembershipService<UserRanchAttributes, UserRanchCreationAttributes>) {
        this.membershipService = membershipService;
    }

    private tenantOptions(req: AuthRequest): MembershipTenantOptions {
        const roles = normalizeUserRoles(req.user?.roles ?? []);
        return { allowCrossTenant: roles.includes(UserRole.SAAS_OWNER) };
    }

    assign = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const response = await this.membershipService.assignUserToRanch(
                req.body,
                req.user?.uuid_company as string,
                this.tenantOptions(req)
            );

            return res.status(201).json(response);
        } catch (error) {
            next(error);
        }
    }

    promoteCompanyAdministrator = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const { uuid_user } = req.body as { uuid_user?: string };
            const response = await this.membershipService.promoteUserToCompanyAdministrator(
                uuid_user as string,
                req.user?.uuid_company as string,
                this.tenantOptions(req)
            );

            return res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    changeRole = async (req: AuthRequest & Request<IGetRoleMembershipParams>, res: Response, next: NextFunction) => {
        try {
            const { uuid_user, uuid_ranch } = req.params;
            const { role } = req.body;
            const response = await this.membershipService.changeRole(
                uuid_user,
                uuid_ranch,
                role,
                req.user?.uuid_company as string,
                this.tenantOptions(req)
            );

            return res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    remove = async (req: AuthRequest & Request<IRemoveRoleMembershipParams>, res: Response, next: NextFunction) => {
        try {
            const { uuid_user, uuid_ranch } = req.params;

            const response = await this.membershipService.removeUserFromRanch(
                uuid_user,
                uuid_ranch,
                req.user?.uuid_company as string,
                this.tenantOptions(req)
            );

            return res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    getUsersByRanch = async (req: AuthRequest & Request<IGetMembershipByRanchParams>, res: Response, next: NextFunction) => {
        try {
            const { uuid_ranch } = req.params;
            const params = buildGetAllParams(req.query);

            const response = await this.membershipService.getUsersByRanch(
                uuid_ranch,
                params,
                req.user?.uuid_company as string,
                this.tenantOptions(req)
            );

            return res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    getRanchesByUser = async (req: AuthRequest & Request<IGetMembershipByUserParams>, res: Response, next: NextFunction) => {
        try {
            const { uuid_user } = req.params;
            const params = buildGetAllParams(req.query);

            const response = await this.membershipService.getRanchesByUser(
                uuid_user,
                params,
                req.user?.uuid_company as string,
                this.tenantOptions(req)
            );

            return res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }
}

export default MembershipController;