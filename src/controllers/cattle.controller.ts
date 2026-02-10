import { Request, Response, NextFunction } from 'express';
import GeneralService from '../services/general.service';
import GeneralModel from '../database/models/general';

class GeneralController {
    private generalService: GeneralService;

    constructor() {
        this.generalService = new GeneralService(GeneralModel);

        this.createGeneral = this.createGeneral.bind(this);
        this.getGeneral = this.getGeneral.bind(this);
        this.getGenerals = this.getGenerals.bind(this);
        this.updateGeneral = this.updateGeneral.bind(this);
        this.deleteGeneral = this.deleteGeneral.bind(this);
    }

    async createGeneral(req: Request, res: Response, next: NextFunction) {
        try {
            const { body } = req;
            const general = await this.generalService.createGeneral({ body });
            res.status(201).json(general);
        } catch (error) {
            next(error);
        }
    }

    async getGeneral(req: Request, res: Response, next: NextFunction) {
        try {
            const { uuid_general } = req.params;
            const general = await this.generalService.getGeneral({ uuid_general: Number(uuid_general) });
            res.status(200).json(general);
        } catch (error) {
            next(error);
        }
    }

    async getGenerals(_req: Request, res: Response, next: NextFunction) {
        try {
            const generals = await this.generalService.getGenerals();
            res.status(200).json(generals);
        } catch (error) {
            next(error);
        }
    }

    async updateGeneral(req: Request, res: Response, next: NextFunction) {
        try {
            const { uuid_general } = req.params;
            const { body } = req;
            const updated = await this.generalService.updateGeneral({ uuid_general: Number(uuid_general), body });
            res.status(200).json(updated);
        } catch (error) {
            next(error);
        }
    }

    async deleteGeneral(req: Request, res: Response, next: NextFunction) {
        try {
            const { uuid_general } = req.params;
            const result = await this.generalService.deleteGeneral({ uuid_general: Number(uuid_general) });
            res.status(200).json({ success: result });
        } catch (error) {
            next(error);
        }
    }
}

export default new GeneralController();
