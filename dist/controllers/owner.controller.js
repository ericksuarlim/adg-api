"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const response_handler_1 = require("../utils/response.handler");
const query_builder_1 = require("../utils/query.builder");
class OwnerController {
    constructor(ownerService) {
        this.ownerService = ownerService;
        this.listOwners = async (req, res, next) => {
            try {
                const params = (0, query_builder_1.buildGetAllParams)(req.query);
                params.sortBy = params.sortBy === "createdAt" ? "full_name" : params.sortBy;
                params.status = "active";
                const usePaginated = req.query.page !== undefined ||
                    req.query.size !== undefined ||
                    req.query.search !== undefined;
                if (usePaginated) {
                    const response = await this.ownerService.listPaginated(params);
                    return (0, response_handler_1.handleResponse)(res, response);
                }
                const response = await this.ownerService.listActive();
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getById = async (req, res, next) => {
            try {
                const { owner_uuid } = req.params;
                const response = await this.ownerService.getById(owner_uuid);
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.create = async (req, res, next) => {
            try {
                const body = req.body;
                const response = await this.ownerService.create(body);
                return (0, response_handler_1.handleResponse)(res, response, 201);
            }
            catch (error) {
                next(error);
            }
        };
        this.update = async (req, res, next) => {
            try {
                const { owner_uuid } = req.params;
                const body = req.body;
                const response = await this.ownerService.update(owner_uuid, body);
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.delete = async (req, res, next) => {
            try {
                const { owner_uuid } = req.params;
                const response = await this.ownerService.delete(owner_uuid);
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = OwnerController;
