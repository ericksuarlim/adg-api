"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const response_handler_1 = require("../utils/response.handler");
const query_builder_1 = require("../utils/query.builder");
const roles_interface_1 = require("../interfaces/roles/roles.interface");
const access_scope_helper_1 = require("../helpers/access-scope.helper");
const apiError_1 = __importDefault(require("../errors/apiError"));
const httpStatusCodes_1 = __importDefault(require("../errors/httpStatusCodes"));
class RanchController {
    constructor(ranchService) {
        this.createRanch = async (req, res, next) => {
            try {
                if ((0, access_scope_helper_1.resolveAccessScope)(req.user) !== "company_all_ranches" && !this.isSaasOwner(req)) {
                    throw new apiError_1.default({
                        name: "Forbidden",
                        statusCode: httpStatusCodes_1.default.FORBIDDEN,
                        description: "Only company administrators or SaaS owners can create ranches",
                    });
                }
                const reqBody = req.body;
                if (this.isSaasOwner(req)) {
                    if (!reqBody.uuid_company?.trim()) {
                        throw new apiError_1.default({
                            name: "ValidationError",
                            statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                            description: "uuid_company is required to create a ranch as SaaS owner",
                        });
                    }
                }
                else {
                    reqBody.uuid_company = req.user?.uuid_company;
                }
                const response = await this.ranchService.create(reqBody);
                if (!response.success) {
                    return res.status(response.code ?? 500).json(response);
                }
                const created = response.data;
                return (0, response_handler_1.handleResponse)(res, response, 201);
            }
            catch (error) {
                next(error);
            }
        };
        this.getRanch = async (req, res, next) => {
            try {
                const { uuid_ranch } = req.params;
                const { includeInactive } = (0, query_builder_1.buildGetByIdParams)(req.query);
                (0, access_scope_helper_1.assertRanchTokenAccess)(req.user, uuid_ranch);
                const ranchFilter = (0, access_scope_helper_1.ranchFilterFromUser)(req.user);
                const response = await this.ranchService.getById({
                    id: uuid_ranch,
                    includeInactive,
                    uuid_company: this.isSaasOwner(req) ? undefined : req.user?.uuid_company,
                    uuid_ranch_in: ranchFilter,
                });
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getRanchPaddocks = async (req, res, next) => {
            try {
                const { uuid_ranch } = req.params;
                (0, access_scope_helper_1.assertRanchTokenAccess)(req.user, uuid_ranch);
                const ranchFilter = (0, access_scope_helper_1.ranchFilterFromUser)(req.user);
                const response = await this.ranchService.listActivePaddocks({
                    uuid_ranch,
                    uuid_company: this.isSaasOwner(req) ? undefined : req.user?.uuid_company,
                    uuid_ranch_in: ranchFilter,
                });
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getRanches = async (req, res, next) => {
            try {
                const params = (0, query_builder_1.buildGetAllParams)(req.query);
                const requestedCompany = typeof req.query.uuid_company === "string" ? req.query.uuid_company : undefined;
                params.uuid_company = this.isSaasOwner(req) ? requestedCompany : req.user?.uuid_company;
                const ranchFilter = (0, access_scope_helper_1.ranchFilterFromUser)(req.user);
                if (ranchFilter?.length) {
                    params.uuid_ranch_in = ranchFilter;
                }
                const response = await this.ranchService.getAll(params);
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.updateRanch = async (req, res, next) => {
            try {
                if ((0, access_scope_helper_1.resolveAccessScope)(req.user) !== "company_all_ranches" && !this.isSaasOwner(req)) {
                    throw new apiError_1.default({
                        name: "Forbidden",
                        statusCode: httpStatusCodes_1.default.FORBIDDEN,
                        description: "Only company administrators or SaaS owners can modify ranches",
                    });
                }
                const { uuid_ranch } = req.params;
                (0, access_scope_helper_1.assertRanchTokenAccess)(req.user, uuid_ranch);
                const reqBody = req.body;
                if (!this.isSaasOwner(req)) {
                    reqBody.uuid_company = req.user?.uuid_company;
                }
                const response = await this.ranchService.update(uuid_ranch, reqBody, this.isSaasOwner(req) ? undefined : { uuid_company: req.user?.uuid_company });
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteRanch = async (req, res, next) => {
            try {
                if ((0, access_scope_helper_1.resolveAccessScope)(req.user) !== "company_all_ranches" && !this.isSaasOwner(req)) {
                    throw new apiError_1.default({
                        name: "Forbidden",
                        statusCode: httpStatusCodes_1.default.FORBIDDEN,
                        description: "Only company administrators or SaaS owners can delete ranches",
                    });
                }
                const { uuid_ranch } = req.params;
                (0, access_scope_helper_1.assertRanchTokenAccess)(req.user, uuid_ranch);
                const response = await this.ranchService.delete(uuid_ranch, this.isSaasOwner(req) ? undefined : { uuid_company: req.user?.uuid_company });
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.ranchService = ranchService;
    }
    isSaasOwner(req) {
        return (req.user?.roles ?? []).includes(roles_interface_1.UserRole.SAAS_OWNER);
    }
}
exports.default = RanchController;
