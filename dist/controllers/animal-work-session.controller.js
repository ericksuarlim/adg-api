"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const query_builder_1 = require("../utils/query.builder");
const response_handler_1 = require("../utils/response.handler");
class AnimalWorkSessionController {
    constructor(animalWorkSessionService) {
        this.getAnimalWorkSessions = async (req, res, next) => {
            try {
                const params = (0, query_builder_1.buildGetAllParams)(req.query);
                const response = await this.animalWorkSessionService.getAll(params);
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (err) {
                next(err);
            }
        };
        this.getAnimalWorkSession = async (req, res, next) => {
            try {
                const { id_animal_work } = req.params;
                const { includeInactive } = (0, query_builder_1.buildGetByIdParams)(req.query);
                const response = await this.animalWorkSessionService.getById({ id: String(id_animal_work), includeInactive });
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (err) {
                next(err);
            }
        };
        this.createAnimalWorkSession = async (req, res, next) => {
            try {
                const body = req.body;
                const response = await this.animalWorkSessionService.create(body);
                return (0, response_handler_1.handleResponse)(res, response, 201);
            }
            catch (err) {
                next(err);
            }
        };
        this.updateAnimalWorkSession = async (req, res, next) => {
            try {
                const { id_animal_work } = req.params;
                const response = await this.animalWorkSessionService.update(String(id_animal_work), req.body);
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (err) {
                next(err);
            }
        };
        this.deleteAnimalWorkSession = async (req, res, next) => {
            try {
                const { id_animal_work } = req.params;
                const response = await this.animalWorkSessionService.delete(String(id_animal_work));
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (err) {
                next(err);
            }
        };
        this.animalWorkSessionService = animalWorkSessionService;
    }
}
exports.default = AnimalWorkSessionController;
