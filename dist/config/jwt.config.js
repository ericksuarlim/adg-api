"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_config_1 = require("./env.config");
const jwtConfig = {
    secret: env_config_1.envConfig.JWT_SECRET || 'fallback-secret',
    expiresIn: '1h',
};
exports.default = jwtConfig;
