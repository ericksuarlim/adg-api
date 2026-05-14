"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const password_chain_factory_1 = __importDefault(require("./password-chain.factory"));
class PasswordValidatorService {
    constructor() {
        this.chain = password_chain_factory_1.default.create();
    }
    validate(password) {
        this.chain.handle(password);
    }
}
exports.default = PasswordValidatorService;
