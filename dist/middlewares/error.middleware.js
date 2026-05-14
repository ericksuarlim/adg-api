"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const map_error_helper_1 = require("../helpers/map-error.helper");
const errorHandler = (err, req, res, next) => {
    const mappedError = (0, map_error_helper_1.mapErrorHelper)(err);
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
exports.default = errorHandler;
