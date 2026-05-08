import { CompanyPlanType } from "./domain.constants";

export const PLAN_PRICES_BS: Record<CompanyPlanType, number> = {
    BASIC: 199,
    PROFESSIONAL: 449,
    PREMIUM: 899
};

export const ANNUAL_DISCOUNT_PERCENT = 8;
