"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const query_builder_1 = require("../utils/query.builder");
const roles_interface_1 = require("../interfaces/roles/roles.interface");
const apiError_1 = __importDefault(require("../errors/apiError"));
const httpStatusCodes_1 = __importDefault(require("../errors/httpStatusCodes"));
class MembershipController {
    constructor(membershipService) {
        this.assign = async (req, res, next) => {
            try {
                const response = await this.membershipService.assignCompanyRole(req.body, req.user?.uuid_company, this.membershipOptions(req));
                return res.status(201).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.promoteCompanyAdministrator = async (req, res, next) => {
            try {
                const roles = (req.user?.roles ?? []);
                if (!roles.includes(roles_interface_1.UserRole.SAAS_OWNER)) {
                    throw new apiError_1.default({
                        name: "Forbidden",
                        statusCode: httpStatusCodes_1.default.FORBIDDEN,
                        description: "Only a SaaS owner can promote a company administrator",
                    });
                }
                const { uuid_user } = req.body;
                const response = await this.membershipService.promoteUserToCompanyAdministrator(uuid_user, req.user?.uuid_company, this.membershipOptions(req));
                return res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.changeRole = async (req, res, next) => {
            try {
                const { uuid_user } = req.params;
                const { role } = req.body;
                const normalized = (0, roles_interface_1.normalizeUserRole)(String(role ?? ""));
                if (!normalized) {
                    throw new apiError_1.default({
                        name: "ValidationError",
                        statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                        description: "role is required",
                    });
                }
                const response = await this.membershipService.changeCompanyUserRole(uuid_user, normalized, req.user?.uuid_company, this.membershipOptions(req));
                return res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.remove = async (req, res, next) => {
            try {
                const { uuid_user } = req.params;
                const response = await this.membershipService.removeUserFromCompany(uuid_user, req.user?.uuid_company, this.membershipOptions(req));
                return res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getUsersByRanch = async (req, res, next) => {
            try {
                const { uuid_ranch } = req.params;
                const params = (0, query_builder_1.buildGetAllParams)(req.query);
                const response = await this.membershipService.getUsersByRanch(uuid_ranch, params, req.user?.uuid_company, this.membershipOptions(req));
                return res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getRanchesByUser = async (req, res, next) => {
            try {
                const { uuid_user } = req.params;
                const params = (0, query_builder_1.buildGetAllParams)(req.query);
                const response = await this.membershipService.getRanchesByUser(uuid_user, params, req.user?.uuid_company, this.membershipOptions(req));
                return res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.membershipService = membershipService;
    }
    membershipOptions(req) {
        const roles = (req.user?.roles ?? []);
        return {
            allowCrossTenant: roles.includes(roles_interface_1.UserRole.SAAS_OWNER),
            actorRoles: (0, roles_interface_1.normalizeUserRoles)(roles),
            requestingUuidUser: req.user?.sub,
        };
    }
}
exports.default = MembershipController;
