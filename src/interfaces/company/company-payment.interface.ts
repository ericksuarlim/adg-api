import { Optional } from "sequelize";

export interface CompanyPaymentAttributes {
    uuid_company_payment: string;
    uuid_company: string;
    amount: number;
    currency: string;
    payment_method: string;
    payment_reference?: string | null;
    notes?: string | null;
    paid_at: Date;
    period_start?: Date | null;
    period_end?: Date | null;
    plan_type: 'BASIC' | 'PROFESSIONAL' | 'PREMIUM';
    billing_cycle: 'MONTHLY' | 'ANNUAL';
    status: 'POSTED' | 'VOIDED';
    is_active: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export type CompanyPaymentCreationAttributes = Optional<
    CompanyPaymentAttributes,
    | 'uuid_company_payment'
    | 'payment_reference'
    | 'notes'
    | 'period_start'
    | 'period_end'
    | 'status'
    | 'is_active'
    | 'created_at'
    | 'updated_at'
>;
