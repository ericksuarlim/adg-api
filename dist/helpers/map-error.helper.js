"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapErrorHelper = void 0;
const sequelize_1 = require("sequelize");
const apiError_1 = __importDefault(require("../errors/apiError"));
const httpStatusCodes_1 = __importDefault(require("../errors/httpStatusCodes"));
const mapErrorHelper = (err) => {
    if (err instanceof apiError_1.default) {
        return err;
    }
    if (err instanceof sequelize_1.UniqueConstraintError) {
        const path = err.errors?.[0]?.path;
        const duplicateCode = path === 'email'
            ? 'EMAIL_IN_USE'
            : path === 'username'
                ? 'USERNAME_IN_USE'
                : path === 'id_card'
                    ? 'ID_CARD_IN_USE'
                    : 'DUPLICATE_VALUE';
        return new apiError_1.default({
            name: 'ConflictError',
            statusCode: httpStatusCodes_1.default.CONFLICT,
            description: duplicateCode
        });
    }
    if (err instanceof sequelize_1.ValidationError) {
        return new apiError_1.default({
            name: 'ValidationError',
            statusCode: httpStatusCodes_1.default.BAD_REQUEST,
            description: err.errors?.[0]?.message || 'Validation error'
        });
    }
    return new apiError_1.default({
        name: 'InternalServerError',
        statusCode: httpStatusCodes_1.default.INTERNAL_SERVER_ERROR,
        description: 'Something went wrong. Please try again.'
    });
};
exports.mapErrorHelper = mapErrorHelper;
