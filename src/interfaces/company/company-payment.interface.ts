import { Optional } from "sequelize";
import { BillingCycle, CompanyPlanType, PaymentMethod, PaymentStatus } from "../../constants/domain.constants";

export interface CompanyPaymentAttributes {
    uuid_company_payment: string;
    uuid_company: string;
    amount: number;
    currency: string;
    payment_method?: PaymentMethod | null;
    payment_reference?: string | null;
    notes?: string | null;
    paid_at: Date;
    period_start?: Date | null;
    period_end?: Date | null;
    plan_type: CompanyPlanType;
    billing_cycle: BillingCycle;
    status: PaymentStatus;
    is_active: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export type CompanyPaymentCreationAttributes = Optional<
    CompanyPaymentAttributes,
    | 'uuid_company_payment'
    | 'amount'
    | 'currency'
    | 'payment_method'
    | 'payment_reference'
    | 'notes'
    | 'period_start'
    | 'period_end'
    | 'status'
    | 'is_active'
    | 'created_at'
    | 'updated_at'
>;
