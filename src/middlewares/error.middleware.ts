import { Request, Response, NextFunction } from 'express';
import ApiError from '../errors/apiError';
import HttpStatusCodes from '../errors/httpStatusCodes';
import { ErrorHandler } from "../interfaces/middleware/error-middleware.interface";

const errorHandler: ErrorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            error: {
                name: err.name,
                message: err.description,
                statusCode: err.statusCode,
            },
        });
    }

    console.error('UNHANDLED ERROR:', err);

    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        error: {
            name: 'InternalServerError',
            message: 'Algo salió mal. Intenta nuevamente.',
            statusCode: 500,
        },
    });
};

export default errorHandler;
