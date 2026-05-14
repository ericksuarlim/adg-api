"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTenantPoolEntry = getTenantPoolEntry;
exports.closeAllTenantPoolConnections = closeAllTenantPoolConnections;
const sequelize_1 = require("sequelize");
const database_config_1 = __importDefault(require("../../config/database.config"));
const env_config_1 = require("../../config/env.config");
const tenant_constants_1 = require("../../constants/tenant.constants");
const tenant_models_factory_1 = require("./tenant-models.factory");
const tenant_schema_service_1 = require("./tenant-schema.service");
const pool = new Map();
const accessOrder = [];
function maxPoolSize() {
    const raw = env_config_1.envConfig.TENANT_POOL_MAX;
    if (raw == null || Number.isNaN(Number(raw))) {
        return tenant_constants_1.DEFAULT_TENANT_POOL_MAX;
    }
    return Math.max(1, Math.min(256, Number(raw)));
}
function touchOrder(databaseName) {
    const idx = accessOrder.indexOf(databaseName);
    if (idx >= 0) {
        accessOrder.splice(idx, 1);
    }
    accessOrder.push(databaseName);
}
async function evictIfNeeded() {
    const max = maxPoolSize();
    while (pool.size >= max && accessOrder.length > 0) {
        const victim = accessOrder.shift();
        if (!victim) {
            break;
        }
        const entry = pool.get(victim);
        if (entry) {
            pool.delete(victim);
            await entry.sequelize.close().catch(() => undefined);
        }
    }
}
/**
 * LRU-ish pool of Sequelize instances keyed by tenant PostgreSQL database name.
 */
async function getTenantPoolEntry(databaseName) {
    const existing = pool.get(databaseName);
    if (existing) {
        existing.lastUsed = Date.now();
        touchOrder(databaseName);
        return existing;
    }
    await evictIfNeeded();
    const sequelize = new sequelize_1.Sequelize(databaseName, database_config_1.default.user, database_config_1.default.password, {
        host: database_config_1.default.host,
        port: Number(database_config_1.default.port),
        dialect: 'postgres',
        logging: false,
        dialectOptions: database_config_1.default.dialectOptions,
    });
    const models = (0, tenant_models_factory_1.buildTenantModelsForSequelize)(sequelize);
    await (0, tenant_schema_service_1.syncTenantOperationalSchema)(sequelize, models);
    const entry = { sequelize, models, lastUsed: Date.now() };
    pool.set(databaseName, entry);
    touchOrder(databaseName);
    return entry;
}
async function closeAllTenantPoolConnections() {
    for (const [, entry] of pool) {
        await entry.sequelize.close().catch(() => undefined);
    }
    pool.clear();
    accessOrder.length = 0;
}
