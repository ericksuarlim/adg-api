import { Request, Response, NextFunction } from 'express';
import { AnimalWorkSessionAttributes, AnimalWorkSessionCreationAttributes } from "../interfaces/work-session/animal-work-session.interface";
import { buildGetAllParams, buildGetByIdParams } from '../utils/query.builder';
import { handleResponse } from '../utils/response.handler';
import { IBaseServiceInterface } from '../interfaces/services/base-service.interface';
import { IncludeInactiveQuery } from '../interfaces/params/query.interface';
import { IDeleteAnimalWorkSessionParams, IGetAnimalWorkSessionParams, IUpdateAnimalWorkSessionParams } from '../interfaces/params/animalWorkSession.interface';

class AnimalWorkSessionController {
    private readonly animalWorkSessionService: IBaseServiceInterface<AnimalWorkSessionAttributes, AnimalWorkSessionCreationAttributes>;

    constructor(animalWorkSessionService: IBaseServiceInterface<AnimalWorkSessionAttributes, AnimalWorkSessionCreationAttributes>) {
        this.animalWorkSessionService = animalWorkSessionService;
    }

    getAnimalWorkSessions = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const params = buildGetAllParams(req.query);
            const response = await this.animalWorkSessionService.getAll(params);
            return handleResponse(res, response);
        } catch (err) {
            next(err);
        }
    }

    getAnimalWorkSession = async (
        req: Request<IGetAnimalWorkSessionParams, {}, {}, IncludeInactiveQuery>,
        res: Response, next: NextFunction) => {
        try {
            const { id_animal_work } = req.params;
            const { includeInactive } = buildGetByIdParams(req.query);
            const response = await this.animalWorkSessionService.getById({ id: String(id_animal_work), includeInactive });
            return handleResponse(res, response);
        } catch (err) {
            next(err);
        }
    }

    createAnimalWorkSession = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const body = req.body as AnimalWorkSessionCreationAttributes;
            const response = await this.animalWorkSessionService.create(body);
            return handleResponse(res, response, 201);
        } catch (err) {
            next(err);
        }
    }

    updateAnimalWorkSession = async (req: Request<IUpdateAnimalWorkSessionParams>, res: Response, next: NextFunction) => {
        try {
            const { id_animal_work } = req.params;
            const response = await this.animalWorkSessionService.update(String(id_animal_work), req.body);
            return handleResponse(res, response);
        } catch (err) {
            next(err);
        }
    }

    deleteAnimalWorkSession = async (req: Request<IDeleteAnimalWorkSessionParams>, res: Response, next: NextFunction) => {
        try {
            const { id_animal_work } = req.params;
            const response = await this.animalWorkSessionService.delete(String(id_animal_work));
            return handleResponse(res, response);
        } catch (err) {
            next(err);
        }
    }
}

export default AnimalWorkSessionController;
