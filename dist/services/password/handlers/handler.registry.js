"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordHandlerRegistry = void 0;
const min_length_handler_1 = __importDefault(require("./min-length.handler"));
const uppercase_handler_1 = __importDefault(require("./uppercase.handler"));
const lowercase_handler_1 = __importDefault(require("./lowercase.handler"));
const number_handler_1 = __importDefault(require("./number.handler"));
const special_char_handler_1 = __importDefault(require("./special-char.handler"));
exports.PasswordHandlerRegistry = {
    minLength: min_length_handler_1.default,
    uppercase: uppercase_handler_1.default,
    lowercase: lowercase_handler_1.default,
    number: number_handler_1.default,
    specialChar: special_char_handler_1.default,
};
