const BaseError = require('./baseError');
const HttpStatusCodes = require('./httpStatusCodes');
import { BaseError } from "./baseError";
import { HttpStatusCodes } from "./baseError";

class ApiError extends BaseError {
    constructor({
            name = 'ApiError',
            statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR,
            description = 'Error en la API',
            isOperational = true,
        }) {
        super(name, statusCode, isOperational, description);
    }
}

module.exports = ApiError;