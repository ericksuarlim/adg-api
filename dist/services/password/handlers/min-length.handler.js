"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_handler_1 = __importDefault(require("./base.handler"));
const apiError_1 = __importDefault(require("../../../errors/apiError"));
class MinLengthHandler extends base_handler_1.default {
    constructor(minLength) {
        super();
        this.minLength = minLength;
    }
    validate(password) {
        if (password.length < this.minLength) {
            throw new apiError_1.default({
                name: 'WeakPassword',
                statusCode: 400,
                description: `Password must be at least ${this.minLength} characters`
            });
        }
    }
}
exports.default = MinLengthHandler;
