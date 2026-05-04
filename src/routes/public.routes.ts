import { Router } from "express";
import { container } from "../containers/container";
import { validatePlatformOnboarding } from "../middlewares/platform-onboarding.middleware";

const publicRoutes = Router();

publicRoutes.post(
    '/company/onboard',
    validatePlatformOnboarding,
    container.companyController.onboardCompanyWithOwner
);

export default publicRoutes;
