import { NextFunction, Request, Response } from "express";
import { envConfig } from "../config";
import ApiError from "../errors/apiError";
import HttpStatusCodes from "../errors/httpStatusCodes";

const PLATFORM_ONBOARDING_HEADER = 'x-platform-onboarding-key';

export const validatePlatformOnboarding = (req: Request, res: Response, next: NextFunction) => {
    const expectedKey = envConfig.PLATFORM_ONBOARDING_KEY;

    if (!expectedKey) {
        return next();
    }

    const providedKey = req.header(PLATFORM_ONBOARDING_HEADER);
    if (providedKey !== expectedKey) {
        return next(new ApiError({
            name: 'Unauthorized',
            statusCode: HttpStatusCodes.UNAUTHORIZED,
            description: 'Invalid onboarding key'
        }));
    }

    next();
};
