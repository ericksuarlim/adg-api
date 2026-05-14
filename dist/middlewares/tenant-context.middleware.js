"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveTenantOperationalContext = void 0;
const models_1 = require("../database/models");
const apiError_1 = __importDefault(require("../errors/apiError"));
const httpStatusCodes_1 = __importDefault(require("../errors/httpStatusCodes"));
const roles_interface_1 = require("../interfaces/roles/roles.interface");
const tenant_sequelize_lru_1 = require("../database/tenant/tenant-sequelize-lru");
const tenant_request_context_1 = require("../database/tenant/tenant-request-context");
const query_builder_1 = require("../utils/query.builder");
const ranch_saas_global_list_helper_1 = require("../helpers/ranch-saas-global-list.helper");
function readUuidCompanyFromQuery(req) {
    const raw = req.query?.uuid_company;
    return typeof raw === 'string' && raw.trim() !== '' ? raw.trim() : undefined;
}
/**
 * Resolves the tenant PostgreSQL database for the current request and exposes models via AsyncLocalStorage.
 * Must run after `authenticate`. SaaS owners: `GET /ranch` without `uuid_company` lists all ranches across
 * tenant DBs. Otherwise supply `uuid_company` (query/body) or `uuid_ranch` in `ranch_company_route`.
 */
const resolveTenantOperationalContext = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new apiError_1.default({
                name: 'Unauthorized',
                statusCode: httpStatusCodes_1.default.UNAUTHORIZED,
                description: 'Authentication required',
            }));
        }
        const roles = req.user.roles ?? [];
        const isSaasOwner = roles.includes(roles_interface_1.UserRole.SAAS_OWNER);
        if (isSaasOwner && req.method === 'GET' && req.path === '/ranch' && !readUuidCompanyFromQuery(req)) {
            const payload = await (0, ranch_saas_global_list_helper_1.listRanchesForSaasOwner)(req.query);
            return res.status(200).json(payload);
        }
        let companyUuid;
        if (isSaasOwner) {
            companyUuid =
                readUuidCompanyFromQuery(req) ??
                    (typeof req.body?.uuid_company === 'string' ? req.body.uuid_company.trim() : undefined);
            const uuidRanchParam = typeof req.params?.uuid_ranch === 'string' ? req.params.uuid_ranch : undefined;
            if (!companyUuid && uuidRanchParam) {
                const route = await models_1.RanchCompanyRouteModel.findByPk(uuidRanchParam);
                companyUuid = route?.uuid_company ?? undefined;
            }
            if (!companyUuid) {
                return next(new apiError_1.default({
                    name: 'ValidationError',
                    statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                    description: 'uuid_company is required (query or body) unless uuid_ranch can be resolved via ranch_company_route',
                }));
            }
        }
        else {
            companyUuid = req.user.uuid_company;
        }
        const company = await models_1.CompanyModel.findOne({
            where: { uuid_company: companyUuid, is_active: true },
        });
        if (!company) {
            return next(new apiError_1.default({
                name: 'NotFound',
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
                description: 'Company not found',
            }));
        }
        const tenantDatabase = company.tenant_database?.trim();
        if (!tenantDatabase) {
            /**
             * Ranch rows live in the tenant DB. Legacy or mis-provisioned companies may have no
             * tenant_database; listing ranches should return an empty page instead of 503 so SaaS
             * UIs (user management, company detail) can still load users.
             */
            const isRanchCollectionList = req.method === 'GET' && req.path === '/ranch';
            if (isRanchCollectionList) {
                const params = (0, query_builder_1.buildGetAllParams)(req.query);
                return res.status(200).json({
                    success: true,
                    data: [],
                    pagination: {
                        totalItems: 0,
                        totalPages: 0,
                        currentPage: params.page,
                        order: params.order,
                        pageSize: params.size,
                    },
                });
            }
            return next(new apiError_1.default({
                name: 'ServiceUnavailable',
                statusCode: httpStatusCodes_1.default.SERVICE_UNAVAILABLE,
                description: 'This company has no tenant database configured. Create the company from SaaS (provisions tenant) or run the legacy migration checklist.',
            }));
        }
        const { sequelize, models } = await (0, tenant_sequelize_lru_1.getTenantPoolEntry)(tenantDatabase);
        tenant_request_context_1.tenantRequestStorage.run({
            uuid_company: companyUuid,
            tenantDatabaseName: tenantDatabase,
            sequelize,
            models,
        }, () => next());
    }
    catch (error) {
        next(error);
    }
};
exports.resolveTenantOperationalContext = resolveTenantOperationalContext;
