"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_config_1 = require("./env.config");
function allowedOriginsFromEnv() {
    const raw = env_config_1.envConfig.CORS_ORIGIN || 'http://localhost:4730';
    return raw
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);
}
const devLocalOrigin = (origin) => {
    if (!origin) {
        return true;
    }
    try {
        const { hostname } = new URL(origin);
        return hostname === 'localhost' || hostname === '127.0.0.1';
    }
    catch {
        return false;
    }
};
const corsOptions = {
    origin: env_config_1.envConfig.NODE_ENV === 'production'
        ? allowedOriginsFromEnv()
        : (origin, callback) => {
            if (devLocalOrigin(origin)) {
                callback(null, true);
                return;
            }
            const list = allowedOriginsFromEnv();
            if (origin && list.includes(origin)) {
                callback(null, true);
                return;
            }
            callback(null, false);
        },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
};
exports.default = corsOptions;
