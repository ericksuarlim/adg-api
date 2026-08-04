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
const cattle_breed_constants_1 = require("../constants/cattle-breed.constants");
class AnimalController {
    constructor(animalService) {
        this.animalService = animalService;
        this.listBreeds = async (_req, res, next) => {
            try {
                return (0, response_handler_1.handleResponse)(res, { success: true, data: cattle_breed_constants_1.CATTLE_BREED_OPTIONS });
            }
            catch (error) {
                next(error);
            }
        };
        this.listParentCandidates = async (req, res, next) => {
            try {
                const ranch_uuid = typeof req.query.ranch_uuid === "string" ? req.query.ranch_uuid : "";
                const sexRaw = typeof req.query.sex === "string" ? req.query.sex.toUpperCase() : "";
                if (!ranch_uuid.trim()) {
                    throw new apiError_1.default({
                        name: "ValidationError",
                        statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                        description: "ranch_uuid query parameter is required",
                    });
                }
                if (sexRaw !== "MALE" && sexRaw !== "FEMALE") {
                    throw new apiError_1.default({
                        name: "ValidationError",
                        statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                        description: "sex query parameter must be MALE or FEMALE",
                    });
                }
                (0, access_scope_helper_1.assertRanchTokenAccess)(req.user, ranch_uuid);
                const tenant = this.animalTenant(req);
                const response = await this.animalService.listParentCandidates(ranch_uuid, sexRaw, tenant);
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.createBatch = async (req, res, next) => {
            try {
                const body = req.body;
                const rows = body?.rows;
                if (!Array.isArray(rows) || rows.length === 0) {
                    throw new apiError_1.default({
                        name: "ValidationError",
                        statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                        description: "rows array is required and must not be empty",
                    });
                }
                const ranchIds = new Set();
                for (const item of rows) {
                    const ranch = item?.animal?.ranch_uuid;
                    if (typeof ranch === "string" && ranch.trim()) {
                        ranchIds.add(ranch.trim());
                    }
                }
                for (const ranchUuid of ranchIds) {
                    (0, access_scope_helper_1.assertRanchTokenAccess)(req.user, ranchUuid);
                }
                const ctx = {
                    jwtCompanyUuid: req.user?.uuid_company,
                    isSaasOwner: this.isSaasOwner(req),
                };
                const response = await this.animalService.createBatch(rows, ctx);
                if (!response.success) {
                    return res.status(response.code ?? 500).json(response);
                }
                const status = response.data && response.data.failed > 0 && response.data.created > 0 ? 207 : 201;
                return (0, response_handler_1.handleResponse)(res, response, status);
            }
            catch (error) {
                next(error);
            }
        };
        this.createAnimal = async (req, res, next) => {
            try {
                const animalBody = req.body;
                if (animalBody.ranch_uuid) {
                    (0, access_scope_helper_1.assertRanchTokenAccess)(req.user, animalBody.ranch_uuid);
                }
                const ctx = {
                    jwtCompanyUuid: req.user?.uuid_company,
                    isSaasOwner: this.isSaasOwner(req),
                };
                const response = await this.animalService.create(animalBody, ctx);
                if (!response.success) {
                    return res.status(response.code ?? 500).json(response);
                }
                return (0, response_handler_1.handleResponse)(res, response, 201);
            }
            catch (error) {
                next(error);
            }
        };
        this.getAnimal = async (req, res, next) => {
            try {
                const { uuid_animal } = req.params;
                const { includeInactive } = (0, query_builder_1.buildGetByIdParams)(req.query);
                const tenant = this.animalTenant(req);
                const response = await this.animalService.getById({
                    id: uuid_animal,
                    includeInactive,
                    uuid_company: tenant.uuid_company,
                    uuid_ranch_in: tenant.uuid_ranch_in,
                });
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getAnimals = async (req, res, next) => {
            try {
                const params = (0, query_builder_1.buildGetAllParams)(req.query);
                const requestedCompany = typeof req.query.uuid_company === "string" ? req.query.uuid_company : undefined;
                params.uuid_company = this.isSaasOwner(req) ? requestedCompany : req.user?.uuid_company;
                const ranchFilter = (0, access_scope_helper_1.ranchFilterFromUser)(req.user);
                if (ranchFilter?.length) {
                    params.uuid_ranch_in = ranchFilter;
                }
                const sexRaw = typeof req.query.sex === "string" ? req.query.sex.trim().toUpperCase() : "";
                if (sexRaw === "MALE" || sexRaw === "FEMALE") {
                    params.sex = sexRaw;
                }
                const response = await this.animalService.getAll(params);
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.updateAnimal = async (req, res, next) => {
            try {
                const { uuid_animal } = req.params;
                const animalBody = req.body;
                const tenant = this.animalTenant(req);
                const existing = await this.animalService.getById({
                    id: uuid_animal,
                    includeInactive: false,
                    uuid_company: tenant.uuid_company,
                    uuid_ranch_in: tenant.uuid_ranch_in,
                });
                (0, access_scope_helper_1.assertRanchTokenAccess)(req.user, existing.data.ranch_uuid);
                const response = await this.animalService.update(uuid_animal, animalBody, tenant);
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.deactivateAnimal = async (req, res, next) => {
            try {
                const { uuid_animal } = req.params;
                const body = req.body;
                const tenant = this.animalTenant(req);
                const existing = await this.animalService.getById({
                    id: uuid_animal,
                    includeInactive: false,
                    uuid_company: tenant.uuid_company,
                    uuid_ranch_in: tenant.uuid_ranch_in,
                });
                (0, access_scope_helper_1.assertRanchTokenAccess)(req.user, existing.data.ranch_uuid);
                const response = await this.animalService.deactivateWithExit(uuid_animal, body, {
                    uuid_company: tenant.uuid_company,
                    uuid_ranch_in: tenant.uuid_ranch_in,
                });
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.deactivateAnimalsBatch = async (req, res, next) => {
            try {
                const body = req.body;
                const tenant = this.animalTenant(req);
                const response = await this.animalService.deactivateBatchWithExit(body, {
                    uuid_company: tenant.uuid_company,
                    uuid_ranch_in: tenant.uuid_ranch_in,
                });
                const status = response.data && response.data.failed > 0 && response.data.success > 0 ? 207 : 200;
                return (0, response_handler_1.handleResponse)(res, response, status);
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteAnimal = async (req, res, next) => {
            try {
                const { uuid_animal } = req.params;
                const tenant = this.animalTenant(req);
                const existing = await this.animalService.getById({
                    id: uuid_animal,
                    includeInactive: false,
                    uuid_company: tenant.uuid_company,
                    uuid_ranch_in: tenant.uuid_ranch_in,
                });
                (0, access_scope_helper_1.assertRanchTokenAccess)(req.user, existing.data.ranch_uuid);
                const response = await this.animalService.delete(uuid_animal, {
                    uuid_company: tenant.uuid_company,
                    uuid_ranch_in: tenant.uuid_ranch_in,
                });
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
    animalTenant(req) {
        const ranchFilter = (0, access_scope_helper_1.ranchFilterFromUser)(req.user);
        return {
            uuid_company: this.isSaasOwner(req) ? undefined : req.user?.uuid_company,
            uuid_ranch_in: ranchFilter?.length ? ranchFilter : undefined,
        };
    }
}
exports.default = AnimalController;
