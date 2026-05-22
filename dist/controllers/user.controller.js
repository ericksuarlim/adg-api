"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const response_handler_1 = require("../utils/response.handler");
const query_builder_1 = require("../utils/query.builder");
const roles_interface_1 = require("../interfaces/roles/roles.interface");
const apiError_1 = __importDefault(require("../errors/apiError"));
const httpStatusCodes_1 = __importDefault(require("../errors/httpStatusCodes"));
class UserController {
    constructor(userService, userManagerService) {
        this.createUser = async (req, res, next) => {
            try {
                const userBody = req.body;
                if (!this.isSaasOwner(req)) {
                    userBody.uuid_company = req.user?.uuid_company;
                }
                const response = await this.userService.create(userBody, (0, roles_interface_1.normalizeUserRoles)((req.user?.roles ?? [])));
                return (0, response_handler_1.handleResponse)(res, response, 201);
            }
            catch (error) {
                next(error);
            }
        };
        this.getUser = async (req, res, next) => {
            try {
                const { uuid_user } = req.params;
                const { includeInactive } = (0, query_builder_1.buildGetByIdParams)(req.query);
                const response = await this.userService.getById({
                    id: uuid_user,
                    includeInactive,
                    uuid_company: this.isSaasOwner(req) ? undefined : req.user?.uuid_company
                });
                return (0, response_handler_1.handleResponse)(res, response, 200);
            }
            catch (error) {
                next(error);
            }
        };
        this.getUsers = async (req, res, next) => {
            try {
                const params = (0, query_builder_1.buildGetAllParams)(req.query);
                const requestedCompany = typeof req.query.uuid_company === 'string'
                    ? req.query.uuid_company
                    : undefined;
                params.uuid_company = this.isSaasOwner(req)
                    ? requestedCompany
                    : req.user?.uuid_company;
                const response = await this.userService.getAll(params);
                return (0, response_handler_1.handleResponse)(res, response, 200);
            }
            catch (error) {
                next(error);
            }
        };
        this.checkUserFieldAvailability = async (req, res, next) => {
            try {
                const requestedCompany = typeof req.query.uuid_company === 'string'
                    ? req.query.uuid_company
                    : undefined;
                const uuid_company = this.isSaasOwner(req) && requestedCompany
                    ? requestedCompany
                    : req.user?.uuid_company;
                if (!uuid_company) {
                    throw new apiError_1.default({
                        name: 'ValidationError',
                        statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                        description: 'Company context is required'
                    });
                }
                const email = typeof req.query.email === 'string' ? req.query.email : undefined;
                const username = typeof req.query.username === 'string' ? req.query.username : undefined;
                const id_card = typeof req.query.id_card === 'string' ? req.query.id_card : undefined;
                const exclude_uuid_user = typeof req.query.exclude_uuid_user === 'string'
                    ? req.query.exclude_uuid_user
                    : undefined;
                const response = await this.userManagerService.checkUserFieldAvailability({
                    email,
                    username,
                    id_card,
                    uuid_company,
                    exclude_uuid_user
                });
                return (0, response_handler_1.handleResponse)(res, response, 200);
            }
            catch (error) {
                next(error);
            }
        };
        this.updateUser = async (req, res, next) => {
            try {
                const { uuid_user } = req.params;
                const userBody = req.body;
                const tenantScope = this.isSaasOwner(req) ? undefined : req.user?.uuid_company;
                if (!this.isSaasOwner(req)) {
                    userBody.uuid_company = req.user?.uuid_company;
                    delete userBody.password;
                }
                const response = await this.userService.update(uuid_user, userBody, {
                    uuid_company: tenantScope,
                    creatorRoles: (0, roles_interface_1.normalizeUserRoles)((req.user?.roles ?? [])),
                });
                return (0, response_handler_1.handleResponse)(res, response, 200);
            }
            catch (error) {
                next(error);
            }
        };
        this.manageUser = async (req, res, next) => {
            try {
                const { uuid_user } = req.params;
                await this.userService.getById({
                    id: uuid_user,
                    uuid_company: this.isSaasOwner(req) ? undefined : req.user?.uuid_company
                });
                const response = await this.userManagerService.manageUser(uuid_user);
                return (0, response_handler_1.handleResponse)(res, response, 200);
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteUser = async (req, res, next) => {
            try {
                const { uuid_user } = req.params;
                const response = await this.userService.delete(uuid_user, {
                    uuid_company: this.isSaasOwner(req) ? undefined : req.user?.uuid_company,
                    requestingUuidUser: req.user?.sub,
                });
                return (0, response_handler_1.handleResponse)(res, response, 200);
            }
            catch (error) {
                next(error);
            }
        };
        this.userService = userService;
        this.userManagerService = userManagerService;
    }
    isSaasOwner(req) {
        return (req.user?.roles ?? []).includes(roles_interface_1.UserRole.SAAS_OWNER);
    }
}
exports.default = UserController;
