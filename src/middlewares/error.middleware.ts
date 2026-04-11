import {ErrorHandler} from "../interfaces/middleware/error-middleware.interface";
import {mapErrorHelper} from "../helpers/map-error.helper";

const errorHandler: ErrorHandler = (err, req, res, next) => {
    const mappedError = mapErrorHelper(err);

    console.error('ERROR:', {
        original: err,
        mapped: mappedError,
        path: req.originalUrl,
        method: req.method,
    });

    return res.status(mappedError.statusCode).json({
        success: false,
        error: {
            name: mappedError.name,
            message: mappedError.description,
            statusCode: mappedError.statusCode,
        },
    });
};

export default errorHandler;
