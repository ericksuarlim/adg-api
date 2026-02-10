import { Request, Response, NextFunction } from 'express';

export interface ErrorHandler {
    (err: any, req: Request, res: Response, next: NextFunction): void;
}
