"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const saas_sequelize_1 = __importDefault(require("./database/saas-sequelize"));
const config_1 = require("./config");
require("./database/saas-models.register");
process.on('uncaughtException', (err) => {
    console.error('uncaughtException:', err);
});
process.on('unhandledRejection', (reason) => {
    console.error('unhandledRejection:', reason);
});
saas_sequelize_1.default.authenticate()
    .then(() => {
    console.log('SaaS database connected');
    const syncAlter = config_1.envConfig.DB_SYNC_ALTER;
    if (syncAlter) {
        console.warn('SaaS DB sync: alter=true (DB_SYNC_ALTER); do not use in production without review.');
    }
    return saas_sequelize_1.default.sync({ alter: syncAlter });
})
    .then(() => {
    const port = Number(config_1.envConfig.PORT) || 3010;
    app_1.default.listen(port, '0.0.0.0', () => {
        console.log(`Server running on http://0.0.0.0:${port} (localhost:${port})`);
    });
})
    .catch((err) => {
    console.error('Unable to connect to database:', err.message);
    process.exit(1);
});
