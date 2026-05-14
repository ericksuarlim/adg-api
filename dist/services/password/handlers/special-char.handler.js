"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_handler_1 = __importDefault(require("./base.handler"));
const apiError_1 = __importDefault(require("../../../errors/apiError"));
const httpStatusCodes_1 = __importDefault(require("../../../errors/httpStatusCodes"));
class SpecialCharHandler extends base_handler_1.default {
    validate(password) {
        if (!/[!@#$%^&*.]/.test(password)) {
            throw new apiError_1.default({
                name: 'WeakPassword',
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: 'Password must contain at least one special character'
            });
        }
    }
}
exports.default = SpecialCharHandler;
