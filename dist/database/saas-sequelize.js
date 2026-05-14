"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_config_1 = __importDefault(require("../config/database.config"));
/**
 * Primary Sequelize connection for the SaaS catalog database (companies, users,
 * sessions, billing, memberships). Operational ranch/animal data lives in per-company tenant databases.
 */
const saasSequelize = new sequelize_1.Sequelize(database_config_1.default.database, database_config_1.default.user, database_config_1.default.password, {
    host: database_config_1.default.host,
    port: Number(database_config_1.default.port),
    dialect: 'postgres',
    logging: database_config_1.default.logging,
    dialectOptions: database_config_1.default.dialectOptions,
});
exports.default = saasSequelize;
