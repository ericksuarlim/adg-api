import { ApiErrorArgs } from '../interfaces/common/api-error.interface';
import BaseError from './baseError';
import HttpStatusCodes from './httpStatusCodes';

class ApiError extends BaseError {
    constructor(args: ApiErrorArgs = {}) {
        super(
            args.name || 'ApiError',
            args.statusCode || HttpStatusCodes.INTERNAL_SERVER_ERROR,
            args.isOperational ?? true,
            args.description || 'Error en la API'
        );
    }
}

export default ApiError;