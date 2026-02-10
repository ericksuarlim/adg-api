import { Request, Response, NextFunction } from 'express';
import CattleService from '../services/cattle.service';
import CattleModel from '../database/models/cattle.model';
import { CattleCreationAttributes } from "../interfaces/cattle/cattle.interface";

class CattleController {
    private cattleService: CattleService;

    constructor() {
        this.cattleService = new CattleService(CattleModel);

        this.createCattle = this.createCattle.bind(this);
        this.getCattle = this.getCattle.bind(this);
        this.getCattles = this.getCattles.bind(this);
        this.updateCattle = this.updateCattle.bind(this);
        this.deleteCattle = this.deleteCattle.bind(this);
    }

    async createCattle(req: Request, res: Response, next: NextFunction) {
        try {
            const cattleBody = req.body as CattleCreationAttributes;
            const response = await this.cattleService.create(cattleBody);

            if (!response.success) {
                return res.status(response.code ?? 500).json(response);
            }

            return res.status(201).json(response);
        } catch (error) {
            next(error);
        }
    }

    async getCattle(req: Request, res: Response, next: NextFunction) {
        try {
            const { uuid_cattle } = req.params;
            const response = await this.cattleService.getById(uuid_cattle);

            if (!response.success) {
                return res.status(response.code ?? 500).json(response);
            }

            return res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    async getCattles(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("Entroooo");
            const page = parseInt(req.query.page as string) || 1;
            const size = parseInt(req.query.size as string) || 10;
            const sortBy = (req.query.sortBy as string) || 'createdAt';
            const order = (((req.query.order as string) || 'desc').toUpperCase() as 'ASC' | 'DESC');

            const response = await this.cattleService.getAll({ page, size, sortBy, order });

            if (!response.success) {
                return res.status(response.code ?? 500).json(response);
            }

            return res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    async updateCattle(req: Request, res: Response, next: NextFunction) {
        try {
            const { uuid_cattle } = req.params;
            const cattleBody = req.body as CattleCreationAttributes;
            const response = await this.cattleService.update(uuid_cattle, cattleBody);

            if (!response.success) {
                return res.status(response.code ?? 500).json(response);
            }

            return res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    async deleteCattle(req: Request, res: Response, next: NextFunction) {
        try {
            const { uuid_cattle } = req.params;
            const response = await this.cattleService.delete(uuid_cattle);

            if (!response.success) {
                return res.status(response.code ?? 500).json(response);
            }

            return res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }
}

export default new CattleController();
