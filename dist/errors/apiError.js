"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const baseError_1 = __importDefault(require("./baseError"));
const httpStatusCodes_1 = __importDefault(require("./httpStatusCodes"));
class ApiError extends baseError_1.default {
    constructor(args = {}) {
        super(args.name || 'ApiError', args.statusCode || httpStatusCodes_1.default.INTERNAL_SERVER_ERROR, args.isOperational ?? true, args.description || 'Error en la API');
    }
}
exports.default = ApiError;
