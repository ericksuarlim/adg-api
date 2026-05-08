import { Optional } from "sequelize";
import { BillingCycle, CompanyPlanType, MembershipStatus } from "../../constants/domain.constants";

export interface CompanyAttributes {
    uuid_company: string;
    name: string;
    legal_name?: string | null;
    tax_id?: string | null;
    plan_type: CompanyPlanType;
    billing_cycle: BillingCycle;
    membership_status: MembershipStatus;
    membership_started_at?: Date | null;
    membership_renewal_at?: Date | null;
    is_active: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export type CompanyCreationAttributes = Optional<
    CompanyAttributes,
    | 'uuid_company'
    | 'plan_type'
    | 'billing_cycle'
    | 'membership_status'
    | 'membership_started_at'
    | 'membership_renewal_at'
    | 'is_active'
    | 'created_at'
    | 'updated_at'
>;
