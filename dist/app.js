"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const error_middleware_1 = __importDefault(require("./middlewares/error.middleware"));
const cors_config_1 = __importDefault(require("./config/cors.config"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)(cors_config_1.default));
app.use(express_1.default.json());
app.use('/api', routes_1.default);
app.use(error_middleware_1.default);
exports.default = app;
