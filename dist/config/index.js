"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.envConfig = exports.corsConfig = exports.jwtConfig = exports.databaseConfig = void 0;
const database_config_1 = __importDefault(require("./database.config"));
exports.databaseConfig = database_config_1.default;
const jwt_config_1 = __importDefault(require("./jwt.config"));
exports.jwtConfig = jwt_config_1.default;
const cors_config_1 = __importDefault(require("./cors.config"));
exports.corsConfig = cors_config_1.default;
const env_config_1 = require("./env.config");
Object.defineProperty(exports, "envConfig", { enumerable: true, get: function () { return env_config_1.envConfig; } });
