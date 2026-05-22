"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const query_builder_1 = require("../utils/query.builder");
const response_handler_1 = require("../utils/response.handler");
const roles_interface_1 = require("../interfaces/roles/roles.interface");
const access_scope_helper_1 = require("../helpers/access-scope.helper");
class CompanyController {
    constructor(companyService) {
        this.checkCompanyFieldAvailability = async (req, res, next) => {
            try {
                const name = typeof req.query.name === 'string' ? req.query.name : undefined;
                const tax_id = typeof req.query.tax_id === 'string' ? req.query.tax_id : undefined;
                const exclude_uuid_company = typeof req.query.exclude_uuid_company === 'string'
                    ? req.query.exclude_uuid_company
                    : undefined;
                const response = await this.companyService.checkCompanyFieldAvailability({
                    name,
                    tax_id,
                    exclude_uuid_company,
                });
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.createCompany = async (req, res, next) => {
            try {
                const reqBody = req.body;
                const response = await this.companyService.create(reqBody);
                return (0, response_handler_1.handleResponse)(res, response, 201);
            }
            catch (error) {
                next(error);
            }
        };
        this.getCompany = async (req, res, next) => {
            try {
                const { uuid_company } = req.params;
                const { includeInactive } = (0, query_builder_1.buildGetByIdParams)(req.query);
                (0, access_scope_helper_1.assertTenantCompany)(req.user, uuid_company);
                const tenantCompany = this.isSaasOwner(req) ? undefined : req.user?.uuid_company;
                const response = await this.companyService.getById({
                    id: uuid_company,
                    includeInactive,
                    uuid_company: tenantCompany
                });
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getCompanies = async (req, res, next) => {
            try {
                const params = (0, query_builder_1.buildGetAllParams)(req.query);
                params.uuid_company = this.isSaasOwner(req) ? undefined : req.user?.uuid_company;
                const response = await this.companyService.getAll(params);
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.updateCompany = async (req, res, next) => {
            try {
                const { uuid_company } = req.params;
                const reqBody = req.body;
                (0, access_scope_helper_1.assertTenantCompany)(req.user, uuid_company);
                const tenantCompany = this.isSaasOwner(req) ? undefined : req.user?.uuid_company;
                const response = await this.companyService.update(uuid_company, reqBody, { uuid_company: tenantCompany });
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteCompany = async (req, res, next) => {
            try {
                const { uuid_company } = req.params;
                (0, access_scope_helper_1.assertTenantCompany)(req.user, uuid_company);
                const tenantCompany = this.isSaasOwner(req) ? undefined : req.user?.uuid_company;
                const response = await this.companyService.delete(uuid_company, { uuid_company: tenantCompany });
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.endCompanySubscription = async (req, res, next) => {
            try {
                const { uuid_company } = req.params;
                (0, access_scope_helper_1.assertTenantCompany)(req.user, uuid_company);
                const tenantCompany = this.isSaasOwner(req) ? undefined : req.user?.uuid_company;
                const response = await this.companyService.endSubscription(uuid_company, { uuid_company: tenantCompany });
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.reactivateCompany = async (req, res, next) => {
            try {
                const { uuid_company } = req.params;
                (0, access_scope_helper_1.assertTenantCompany)(req.user, uuid_company);
                const tenantCompany = this.isSaasOwner(req) ? undefined : req.user?.uuid_company;
                const response = await this.companyService.reactivate(uuid_company, { uuid_company: tenantCompany });
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.activateTrial = async (req, res, next) => {
            try {
                const { uuid_company } = req.params;
                const { trial_start_date, trial_end_date } = req.body;
                (0, access_scope_helper_1.assertTenantCompany)(req.user, uuid_company);
                const tenantCompany = this.isSaasOwner(req) ? undefined : req.user?.uuid_company;
                const response = await this.companyService.activateTrial(uuid_company, trial_start_date, trial_end_date, { uuid_company: tenantCompany });
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.companyService = companyService;
    }
    isSaasOwner(req) {
        return (req.user?.roles ?? []).includes(roles_interface_1.UserRole.SAAS_OWNER);
    }
}
exports.default = CompanyController;
