"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const response_handler_1 = require("../utils/response.handler");
const query_builder_1 = require("../utils/query.builder");
const roles_interface_1 = require("../interfaces/roles/roles.interface");
class CompanyPaymentController {
    constructor(companyPaymentService) {
        this.getCompanyPayments = async (req, res, next) => {
            try {
                const params = (0, query_builder_1.buildGetAllParams)(req.query);
                const tenantScope = this.isSaasOwner(req) ? req.params.uuid_company : req.user?.uuid_company;
                params.uuid_company = tenantScope;
                const response = await this.companyPaymentService.getAll(params);
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getCompanyPayment = async (req, res, next) => {
            try {
                const { includeInactive } = (0, query_builder_1.buildGetByIdParams)(req.query);
                const tenantScope = this.isSaasOwner(req) ? req.params.uuid_company : req.user?.uuid_company;
                const response = await this.companyPaymentService.getById({
                    id: req.params.uuid_company_payment,
                    includeInactive,
                    uuid_company: tenantScope
                });
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.createCompanyPayment = async (req, res, next) => {
            try {
                const body = req.body;
                body.uuid_company = this.isSaasOwner(req) ? req.params.uuid_company : req.user?.uuid_company;
                const response = await this.companyPaymentService.create(body);
                return (0, response_handler_1.handleResponse)(res, response, 201);
            }
            catch (error) {
                next(error);
            }
        };
        this.updateCompanyPayment = async (req, res, next) => {
            try {
                const body = req.body;
                const tenantScope = this.isSaasOwner(req) ? req.params.uuid_company : req.user?.uuid_company;
                body.uuid_company = tenantScope;
                const response = await this.companyPaymentService.update(req.params.uuid_company_payment, body, { uuid_company: tenantScope });
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteCompanyPayment = async (req, res, next) => {
            try {
                const tenantScope = this.isSaasOwner(req) ? req.params.uuid_company : req.user?.uuid_company;
                const response = await this.companyPaymentService.delete(req.params.uuid_company_payment, {
                    uuid_company: tenantScope
                });
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.companyPaymentService = companyPaymentService;
    }
    isSaasOwner(req) {
        return (req.user?.roles ?? []).includes(roles_interface_1.UserRole.SAAS_OWNER);
    }
}
exports.default = CompanyPaymentController;
