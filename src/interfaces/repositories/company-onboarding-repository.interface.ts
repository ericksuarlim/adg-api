import {
    CompanyOnboardingData,
    CompanyOnboardingResult
} from "../company/company-onboarding.interface";

export interface ICompanyOnboardingRepository<TInput, TOutput> {
    existsByTaxId(taxId?: string | null): Promise<boolean>;
    existsByUsername(username: string): Promise<boolean>;
    existsByEmail(email: string): Promise<boolean>;
    createCompanyOwnerWithTransaction(
        data: TInput,
        passwordHash: string
    ): Promise<TOutput>;
}

export type ICompanyOnboardingDefaultRepository = ICompanyOnboardingRepository<
    CompanyOnboardingData,
    CompanyOnboardingResult
>;
