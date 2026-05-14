import { BillingCycle, CompanyPlanType, COMPANY_PLAN_TYPES, BILLING_CYCLES } from "./domain.constants";

/** Full-year subscription price in USD (used when billing_cycle is ANNUAL). */
export const PLAN_ANNUAL_PRICE_USD: Record<CompanyPlanType, number> = {
    ESSENTIAL: 399,
    PROFESSIONAL: 749,
    ENTERPRISE: 1199
};

/** Maximum active animals company-wide (all ranches) per contracted plan tier. */
export const PLAN_HEAD_LIMIT: Record<CompanyPlanType, number> = {
    ESSENTIAL: 300,
    PROFESSIONAL: 1500,
    ENTERPRISE: 5000
};

const LEGACY_PLAN_MAP: Record<string, CompanyPlanType> = {
    BASIC: "ESSENTIAL",
    PREMIUM: "ENTERPRISE",
    PROFESSIONAL: "PROFESSIONAL"
};

export function normalizeCompanyPlanType(plan: string): CompanyPlanType {
    if (COMPANY_PLAN_TYPES.includes(plan as CompanyPlanType)) {
        return plan as CompanyPlanType;
    }
    return LEGACY_PLAN_MAP[plan] ?? "ESSENTIAL";
}

const LEGACY_BILLING_MAP: Record<string, BillingCycle> = {
    MONTHLY: "SEMESTRAL",
    SEMESTRAL: "SEMESTRAL",
    ANNUAL: "ANNUAL"
};

export function normalizeBillingCycle(cycle: string): BillingCycle {
    if (BILLING_CYCLES.includes(cycle as BillingCycle)) {
        return cycle as BillingCycle;
    }
    return LEGACY_BILLING_MAP[cycle] ?? "ANNUAL";
}

/**
 * Amount charged for the selected billing period in USD.
 * Semestral = half of the annual list price (six months).
 */
export function getSubscriptionChargeUsd(planType: string, billingCycle: BillingCycle): number {
    const plan = normalizeCompanyPlanType(planType);
    const annual = PLAN_ANNUAL_PRICE_USD[plan];
    if (billingCycle === "ANNUAL") {
        return annual;
    }
    return Number((annual / 2).toFixed(2));
}
