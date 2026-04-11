import { UniqueConstraintError, ValidationError } from "sequelize";
import ApiError from "../errors/apiError";
import HttpStatusCodes from "../errors/httpStatusCodes";

export const mapErrorHelper = (err: any): ApiError => {

    if (err instanceof ApiError) {
        return err;
    }

    if (err instanceof UniqueConstraintError) {
        return new ApiError({
            name: 'ConflictError',
            statusCode: HttpStatusCodes.CONFLICT,
            description: err.errors?.[0]?.message || 'Duplicate value'
        });
    }

    if (err instanceof ValidationError) {
        return new ApiError({
            name: 'ValidationError',
            statusCode: HttpStatusCodes.BAD_REQUEST,
            description: err.errors?.[0]?.message || 'Validation error'
        });
    }

    return new ApiError({
        name: 'InternalServerError',
        statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        description: 'Something went wrong. Please try again.'
    });
};
