import { Request, Response, NextFunction } from 'express';
import { handleResponse } from '../utils/response.handler';
import HealthService from '../services/health.service';

class HealthController {
    private readonly healthService: HealthService;

    constructor(healthService: HealthService) {
        this.healthService = healthService;
    }

    check = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const response = await this.healthService.check();
            return handleResponse(res, response);
        } catch (error) {
            next(error);
        }
    };
}

export default HealthController;
