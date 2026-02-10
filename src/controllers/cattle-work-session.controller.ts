import { Request, Response, NextFunction } from 'express';

import CattleWorkSessionModel from "../database/models/cattle-work-session.model";
import CattleWorkSessionService from "../services/cattle-work-session.service";
import {CattleWorkSessionCreationAttributes} from "../interfaces/work-session/cattle-work-session.interface";

class CattleWorkSessionController {
    private service: CattleWorkSessionService;

    constructor() {
        this.service = new CattleWorkSessionService(CattleWorkSessionModel);

        this.getCattleWorkSession = this.getCattleWorkSession.bind(this);
        this.getCattleWorkSessions = this.getCattleWorkSessions.bind(this);
        this.createCattleWorkSession = this.createCattleWorkSession.bind(this);
        this.updateCattleWorkSession = this.updateCattleWorkSession.bind(this);
        this.deleteCattleWorkSession = this.deleteCattleWorkSession.bind(this);
    }

    async getCattleWorkSessions(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const size = parseInt(req.query.size as string) || 10;
            const sortBy = (req.query.sortBy as string) || 'created_at';
            const order = (((req.query.order as string) || 'desc').toUpperCase() as 'ASC' | 'DESC');

            const response = await this.service.getAll({ page, size, sortBy, order });

            if (!response.success) {
                return res.status(response.code ?? 500).json(response);
            }

            return res.status(200).json(response);
        } catch (err) {
            next(err);
        }
    }

    async getCattleWorkSession(req: Request, res: Response, next: NextFunction) {
        try {
            const { id_cattle_work } = req.params;
            const response = await this.service.getById(id_cattle_work);

            if (!response.success) {
                return res.status(response.code ?? 404).json(response);
            }

            return res.status(200).json(response);
        } catch (err) {
            next(err);
        }
    }

    async createCattleWorkSession(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as CattleWorkSessionCreationAttributes;
            const response = await this.service.create(body);

            if (!response.success) {
                return res.status(response.code ?? 400).json(response);
            }

            return res.status(201).json(response);
        } catch (err) {
            next(err);
        }
    }

    async updateCattleWorkSession(req: Request, res: Response, next: NextFunction) {
        try {
            const { id_cattle_work } = req.params;
            const response = await this.service.update(id_cattle_work, req.body);

            if (!response.success) {
                return res.status(response.code ?? 400).json(response);
            }

            return res.status(200).json(response);
        } catch (err) {
            next(err);
        }
    }

    async deleteCattleWorkSession(req: Request, res: Response, next: NextFunction) {
        try {
            const { id_cattle_work } = req.params;
            const response = await this.service.delete(id_cattle_work);

            if (!response.success) {
                return res.status(response.code ?? 400).json(response);
            }

            return res.status(200).json(response);
        } catch (err) {
            next(err);
        }
    }
}

export default new CattleWorkSessionController();
