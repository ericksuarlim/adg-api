"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLAN_HEAD_LIMIT = exports.PLAN_ANNUAL_PRICE_USD = void 0;
exports.normalizeCompanyPlanType = normalizeCompanyPlanType;
exports.normalizeBillingCycle = normalizeBillingCycle;
exports.getSubscriptionChargeUsd = getSubscriptionChargeUsd;
const domain_constants_1 = require("./domain.constants");
/** Full-year subscription price in USD (used when billing_cycle is ANNUAL). */
exports.PLAN_ANNUAL_PRICE_USD = {
    ESSENTIAL: 399,
    PROFESSIONAL: 749,
    ENTERPRISE: 1199
};
/** Maximum active animals company-wide (all ranches) per contracted plan tier. */
exports.PLAN_HEAD_LIMIT = {
    ESSENTIAL: 300,
    PROFESSIONAL: 1500,
    ENTERPRISE: 5000
};
const LEGACY_PLAN_MAP = {
    BASIC: "ESSENTIAL",
    PREMIUM: "ENTERPRISE",
    PROFESSIONAL: "PROFESSIONAL"
};
function normalizeCompanyPlanType(plan) {
    if (domain_constants_1.COMPANY_PLAN_TYPES.includes(plan)) {
        return plan;
    }
    return LEGACY_PLAN_MAP[plan] ?? "ESSENTIAL";
}
const LEGACY_BILLING_MAP = {
    MONTHLY: "SEMESTRAL",
    SEMESTRAL: "SEMESTRAL",
    ANNUAL: "ANNUAL"
};
function normalizeBillingCycle(cycle) {
    if (domain_constants_1.BILLING_CYCLES.includes(cycle)) {
        return cycle;
    }
    return LEGACY_BILLING_MAP[cycle] ?? "ANNUAL";
}
/**
 * Amount charged for the selected billing period in USD.
 * Semestral = half of the annual list price (six months).
 */
function getSubscriptionChargeUsd(planType, billingCycle) {
    const plan = normalizeCompanyPlanType(planType);
    const annual = exports.PLAN_ANNUAL_PRICE_USD[plan];
    if (billingCycle === "ANNUAL") {
        return annual;
    }
    return Number((annual / 2).toFixed(2));
}
