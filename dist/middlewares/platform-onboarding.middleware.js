"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePlatformOnboarding = void 0;
const config_1 = require("../config");
const apiError_1 = __importDefault(require("../errors/apiError"));
const httpStatusCodes_1 = __importDefault(require("../errors/httpStatusCodes"));
const PLATFORM_ONBOARDING_HEADER = 'x-platform-onboarding-key';
const validatePlatformOnboarding = (req, res, next) => {
    const expectedKey = config_1.envConfig.PLATFORM_ONBOARDING_KEY;
    if (!expectedKey) {
        return next();
    }
    const providedKey = req.header(PLATFORM_ONBOARDING_HEADER);
    if (providedKey !== expectedKey) {
        return next(new apiError_1.default({
            name: 'Unauthorized',
            statusCode: httpStatusCodes_1.default.UNAUTHORIZED,
            description: 'Invalid onboarding key'
        }));
    }
    next();
};
exports.validatePlatformOnboarding = validatePlatformOnboarding;
