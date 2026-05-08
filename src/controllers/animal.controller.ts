import { Request, Response, NextFunction } from 'express';
import { AnimalAttributes, AnimalCreationAttributes } from "../interfaces/animal/animal.interface";
import { handleResponse } from '../utils/response.handler';
import { buildGetAllParams, buildGetByIdParams } from '../utils/query.builder';
import { IBaseServiceInterface } from '../interfaces/services/base-service.interface';
import { IncludeInactiveQuery } from '../interfaces/params/query.interface';
import { IDeleteAnimalParams, IGetAnimalParams, IUpdateAnimalParams } from '../interfaces/params/animalParams.interface';
import { AuthRequest } from "../interfaces/middleware/auth-middleware.interface";

class AnimalController {
    private readonly animalService: IBaseServiceInterface<AnimalAttributes, AnimalCreationAttributes>;

    constructor(animalService: IBaseServiceInterface<AnimalAttributes, AnimalCreationAttributes>) {
        this.animalService = animalService;
    }

    createAnimal = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const animalBody = req.body as AnimalCreationAttributes;
            animalBody.uuid_company = req.user?.uuid_company as string;
            const response = await this.animalService.create(animalBody);

            if (!response.success) {
                return res.status(response.code ?? 500).json(response);
            }

            return handleResponse(res, response, 201);
        } catch (error) {
            next(error);
        }
    }

    getAnimal = async (
        req: AuthRequest & Request<IGetAnimalParams, {}, {}, IncludeInactiveQuery>,
        res: Response, next: NextFunction) => {
        try {
            const { uuid_animal } = req.params;
            const { includeInactive } = buildGetByIdParams(req.query);

            const response = await this.animalService.getById({
                id: uuid_animal,
                includeInactive,
                uuid_company: req.user?.uuid_company
            });

            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    }

    getAnimals = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const params = buildGetAllParams(req.query);
            params.uuid_company = req.user?.uuid_company;

            const response = await this.animalService.getAll(params);
            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    }

    updateAnimal = async (req: AuthRequest & Request<IUpdateAnimalParams>, res: Response, next: NextFunction) => {
        try {
            const { uuid_animal } = req.params;
            const animalBody = req.body as AnimalCreationAttributes;
            animalBody.uuid_company = req.user?.uuid_company as string;
            const response = await this.animalService.update(uuid_animal, animalBody, {
                uuid_company: req.user?.uuid_company
            });
            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    }

    deleteAnimal = async (req: AuthRequest & Request<IDeleteAnimalParams>, res: Response, next: NextFunction) => {
        try {
            const { uuid_animal } = req.params;
            const response = await this.animalService.delete(uuid_animal, {
                uuid_company: req.user?.uuid_company
            });
            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    }
}

export default AnimalController;
