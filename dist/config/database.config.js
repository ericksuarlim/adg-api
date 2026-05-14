"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_config_1 = require("./env.config");
const databaseConfig = {
    user: env_config_1.envConfig.DB_USER,
    password: env_config_1.envConfig.DB_PASSWORD,
    database: env_config_1.envConfig.DB_NAME,
    host: env_config_1.envConfig.DB_HOST,
    port: env_config_1.envConfig.DB_PORT,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: false,
    },
};
exports.default = databaseConfig;
