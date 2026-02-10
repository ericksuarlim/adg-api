import { Request, Response, NextFunction } from 'express';

import _CattleWorkRecord from '../database/models/cattleWorkRecord';
import { CattleWorkRecordCreationAttributes } from '../interfaces/cattle/cattleWorkRecord.model.interface';

class CattleWorkSessionController {
    private service: CattleWorkRecordService;

    constructor() {
        this.service = new CattleWorkRecordService(_CattleWorkRecord);

        this.getCattleWorkRecord = this.getCattleWorkRecord.bind(this);
        this.getCattleWorkRecords = this.getCattleWorkRecords.bind(this);
        this.createCattleWorkRecord = this.createCattleWorkRecord.bind(this);
        this.updateCattleWorkRecord = this.updateCattleWorkRecord.bind(this);
        this.deleteCattleWorkRecord = this.deleteCattleWorkRecord.bind(this);
    }

    async getCattleWorkRecords(req: Request, res: Response, next: NextFunction) {
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

    async getCattleWorkRecord(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const response = await this.service.getById(id);

            if (!response.success) {
                return res.status(response.code ?? 404).json(response);
            }

            return res.status(200).json(response);
        } catch (err) {
            next(err);
        }
    }

    async createCattleWorkRecord(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body as CattleWorkRecordCreationAttributes;
            const response = await this.service.create(body);

            if (!response.success) {
                return res.status(response.code ?? 400).json(response);
            }

            return res.status(201).json(response);
        } catch (err) {
            next(err);
        }
    }

    async updateCattleWorkRecord(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const response = await this.service.update(id, req.body);

            if (!response.success) {
                return res.status(response.code ?? 400).json(response);
            }

            return res.status(200).json(response);
        } catch (err) {
            next(err);
        }
    }

    async deleteCattleWorkRecord(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const response = await this.service.delete(id);

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
