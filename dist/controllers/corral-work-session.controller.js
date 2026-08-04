"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const response_handler_1 = require("../utils/response.handler");
const query_builder_1 = require("../utils/query.builder");
class CorralWorkSessionController {
    constructor(service) {
        this.getAll = async (req, res, next) => {
            try {
                const base = (0, query_builder_1.buildGetAllParams)(req.query);
                const response = await this.service.getAll({
                    page: base.page,
                    size: base.size,
                    sortBy: base.sortBy,
                    order: base.order,
                    ranch_uuid: typeof req.query.ranch_uuid === 'string' ? req.query.ranch_uuid : undefined,
                    status: typeof req.query.status === 'string' ? req.query.status : undefined,
                    work_date: typeof req.query.work_date === 'string' ? req.query.work_date : undefined,
                });
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getById = async (req, res, next) => {
            try {
                const response = await this.service.getById(req.params.uuid_corral_work_session);
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getWorkspace = async (req, res, next) => {
            try {
                const response = await this.service.getWorkspace(req.params.uuid_corral_work_session);
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.create = async (req, res, next) => {
            try {
                const body = req.body;
                if (req.user?.username) {
                    body.created_by = req.user.username;
                }
                const response = await this.service.create(body);
                return (0, response_handler_1.handleResponse)(res, response, 201);
            }
            catch (error) {
                next(error);
            }
        };
        this.start = async (req, res, next) => {
            try {
                const response = await this.service.start(req.params.uuid_corral_work_session);
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.close = async (req, res, next) => {
            try {
                const response = await this.service.close(req.params.uuid_corral_work_session);
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.saveStepGrid = async (req, res, next) => {
            try {
                const body = req.body;
                const response = await this.service.saveStepGrid(req.params.uuid_corral_work_session, req.params.uuid_corral_session_step, body);
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.lookupAnimal = async (req, res, next) => {
            try {
                const identifier = typeof req.query.identifier === 'string' ? req.query.identifier : '';
                const response = await this.service.lookupAnimal(req.params.uuid_corral_work_session, identifier);
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.upsertFinding = async (req, res, next) => {
            try {
                const body = req.body;
                const response = await this.service.upsertFinding(req.params.uuid_corral_work_session, body);
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.service = service;
    }
}
exports.default = CorralWorkSessionController;
