"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSessionJobs = void 0;
const node_schedule_1 = __importDefault(require("node-schedule"));
const initSessionJobs = (repository) => {
    node_schedule_1.default.scheduleJob('0 0 1 * *', async () => {
        await repository.deleteExpiredSession();
    });
    node_schedule_1.default.scheduleJob('0 0 * * *', async () => {
        await repository.resetSession();
    });
};
exports.initSessionJobs = initSessionJobs;
