import { ServiceResponse } from "../common/service-response.interface";
import {
    CompanyOnboardingData,
    CompanyOnboardingResult
} from "../company/company-onboarding.interface";

export interface ICompanyOnboardingService {
    onboardCompany(data: CompanyOnboardingData): Promise<ServiceResponse<CompanyOnboardingResult>>;
}
