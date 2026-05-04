import { Optional } from "sequelize";

export interface CompanyAttributes {
    uuid_company: string;
    name: string;
    legal_name?: string | null;
    tax_id?: string | null;
    plan_type: 'BASIC' | 'PROFESSIONAL' | 'PREMIUM';
    billing_cycle: 'MONTHLY' | 'ANNUAL';
    membership_status: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED';
    membership_started_at?: Date | null;
    membership_renewal_at?: Date | null;
    is_active: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export type CompanyCreationAttributes = Optional<CompanyAttributes, 'uuid_company' | 'is_active' | 'created_at' | 'updated_at'>;
