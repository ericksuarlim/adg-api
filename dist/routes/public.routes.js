"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const container_1 = require("../containers/container");
const platform_onboarding_middleware_1 = require("../middlewares/platform-onboarding.middleware");
const publicRoutes = (0, express_1.Router)();
publicRoutes.post('/company/onboard', platform_onboarding_middleware_1.validatePlatformOnboarding, container_1.container.companyController.onboardCompanyWithOwner);
exports.default = publicRoutes;
