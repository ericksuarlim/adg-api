import { UserRole } from "../roles/roles.interface";

export interface CompanyOwnerOnboardingData {
    id_card: string;
    first_name: string;
    last_name: string;
    second_last_name?: string | null;
    email: string;
    username: string;
    password: string;
    phone?: string | null;
}

export interface CompanyOnboardingData {
    name: string;
    legal_name?: string | null;
    tax_id?: string | null;
    owner: CompanyOwnerOnboardingData;
}

export interface CompanyOnboardingResult {
    company: {
        uuid_company: string;
        name: string;
        legal_name?: string | null;
        tax_id?: string | null;
    };
    owner: {
        uuid_user: string;
        uuid_company: string;
        username: string;
        email: string;
        role: UserRole;
    };
    tenant_database: string;
}
