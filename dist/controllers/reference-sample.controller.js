"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const response_handler_1 = require("../utils/response.handler");
const query_builder_1 = require("../utils/query.builder");
class ReferenceSampleController {
    constructor(referenceSampleService) {
        this.create = async (req, res, next) => {
            try {
                const body = req.body;
                if (req.user?.uuid_company) {
                    body.uuid_company = req.user.uuid_company;
                }
                const response = await this.referenceSampleService.create(body);
                if (!response.success) {
                    return res.status(response.code ?? 500).json(response);
                }
                return (0, response_handler_1.handleResponse)(res, response, 201);
            }
            catch (error) {
                next(error);
            }
        };
        this.getById = async (req, res, next) => {
            try {
                const { uuid_reference_sample } = req.params;
                const { includeInactive } = (0, query_builder_1.buildGetByIdParams)(req.query);
                const response = await this.referenceSampleService.getById({
                    id: uuid_reference_sample,
                    includeInactive,
                    uuid_company: req.user?.uuid_company
                });
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getAll = async (req, res, next) => {
            try {
                const params = (0, query_builder_1.buildGetAllParams)(req.query);
                params.uuid_company = req.user?.uuid_company;
                const response = await this.referenceSampleService.getAll(params);
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.update = async (req, res, next) => {
            try {
                const { uuid_reference_sample } = req.params;
                const body = req.body;
                if (req.user?.uuid_company) {
                    body.uuid_company = req.user.uuid_company;
                }
                const response = await this.referenceSampleService.update(uuid_reference_sample, body, { uuid_company: req.user?.uuid_company });
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.delete = async (req, res, next) => {
            try {
                const { uuid_reference_sample } = req.params;
                const response = await this.referenceSampleService.delete(uuid_reference_sample, {
                    uuid_company: req.user?.uuid_company
                });
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.referenceSampleService = referenceSampleService;
    }
}
exports.default = ReferenceSampleController;
