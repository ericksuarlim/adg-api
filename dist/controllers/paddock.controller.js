"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const response_handler_1 = require("../utils/response.handler");
const roles_interface_1 = require("../interfaces/roles/roles.interface");
const access_scope_helper_1 = require("../helpers/access-scope.helper");
const apiError_1 = __importDefault(require("../errors/apiError"));
const httpStatusCodes_1 = __importDefault(require("../errors/httpStatusCodes"));
const query_builder_1 = require("../utils/query.builder");
class PaddockController {
    constructor(paddockService) {
        this.paddockService = paddockService;
        this.listByRanch = async (req, res, next) => {
            try {
                const baseParams = (0, query_builder_1.buildGetAllParams)(req.query);
                baseParams.sortBy = baseParams.sortBy === "createdAt" ? "name" : baseParams.sortBy;
                baseParams.status = "active";
                const ranch_uuid = typeof req.query.ranch_uuid === "string" ? req.query.ranch_uuid.trim() : "";
                if (ranch_uuid) {
                    (0, access_scope_helper_1.assertRanchTokenAccess)(req.user, ranch_uuid);
                    baseParams.ranch_uuid = ranch_uuid;
                }
                const uuidCompany = typeof req.query.uuid_company === "string" ? req.query.uuid_company.trim() : "";
                if (uuidCompany) {
                    baseParams.uuid_company = uuidCompany;
                }
                const ranchInRaw = typeof req.query.uuid_ranch_in === "string" ? req.query.uuid_ranch_in : "";
                if (ranchInRaw) {
                    baseParams.uuid_ranch_in = ranchInRaw.split(",").map((v) => v.trim()).filter(Boolean);
                }
                const ranchFilter = (0, access_scope_helper_1.ranchFilterFromUser)(req.user);
                if (ranchFilter?.length && !baseParams.ranch_uuid) {
                    baseParams.uuid_ranch_in = baseParams.uuid_ranch_in?.length
                        ? baseParams.uuid_ranch_in.filter((id) => ranchFilter.includes(id))
                        : ranchFilter;
                }
                if (!this.isSaasOwner(req) && !baseParams.uuid_company) {
                    baseParams.uuid_company = req.user?.uuid_company;
                }
                const usePaginated = req.query.page !== undefined ||
                    req.query.size !== undefined ||
                    req.query.search !== undefined ||
                    baseParams.uuid_company ||
                    (baseParams.uuid_ranch_in?.length ?? 0) > 0;
                if (usePaginated) {
                    const response = await this.paddockService.listPaginated(baseParams, this.accessContext(req));
                    return (0, response_handler_1.handleResponse)(res, response);
                }
                if (!ranch_uuid) {
                    throw new apiError_1.default({
                        name: "ValidationError",
                        statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                        description: "ranch_uuid query parameter is required",
                    });
                }
                const response = await this.paddockService.listByRanch(ranch_uuid, this.accessContext(req));
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getById = async (req, res, next) => {
            try {
                const { paddock_uuid } = req.params;
                const response = await this.paddockService.getById(paddock_uuid, this.accessContext(req));
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.create = async (req, res, next) => {
            try {
                const body = req.body;
                if (body.ranch_uuid) {
                    (0, access_scope_helper_1.assertRanchTokenAccess)(req.user, body.ranch_uuid);
                }
                const response = await this.paddockService.create(body, this.accessContext(req));
                return (0, response_handler_1.handleResponse)(res, response, 201);
            }
            catch (error) {
                next(error);
            }
        };
        this.update = async (req, res, next) => {
            try {
                const { paddock_uuid } = req.params;
                const body = req.body;
                const response = await this.paddockService.update(paddock_uuid, body, this.accessContext(req));
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.delete = async (req, res, next) => {
            try {
                const { paddock_uuid } = req.params;
                const response = await this.paddockService.delete(paddock_uuid, this.accessContext(req));
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
    }
    isSaasOwner(req) {
        return (req.user?.roles ?? []).includes(roles_interface_1.UserRole.SAAS_OWNER);
    }
    accessContext(req) {
        return {
            uuid_company: this.isSaasOwner(req) ? undefined : req.user?.uuid_company,
            uuid_ranch_in: (0, access_scope_helper_1.ranchFilterFromUser)(req.user),
        };
    }
}
exports.default = PaddockController;
