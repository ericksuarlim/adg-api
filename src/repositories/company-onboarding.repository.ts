import { Transaction } from "sequelize";
import sequelize from "../database";
import { CompanyModel, RanchModel, UserModel, UserRanchModel } from "../database/models";
import {
    CompanyOnboardingData,
    CompanyOnboardingResult
} from "../interfaces/company/company-onboarding.interface";
import { UserRole } from "../interfaces/roles/roles.interface";
import { ICompanyOnboardingRepository } from "../interfaces/repositories/company-onboarding-repository.interface";

class CompanyOnboardingRepository implements ICompanyOnboardingRepository<CompanyOnboardingData, CompanyOnboardingResult> {
    async existsByTaxId(taxId?: string | null): Promise<boolean> {
        if (!taxId) {
            return false;
        }

        const company = await CompanyModel.findOne({ where: { tax_id: taxId } });
        return Boolean(company);
    }

    async existsByUsername(username: string): Promise<boolean> {
        const user = await UserModel.findOne({ where: { username } });
        return Boolean(user);
    }

    async existsByEmail(email: string): Promise<boolean> {
        const user = await UserModel.findOne({ where: { email } });
        return Boolean(user);
    }

    async createCompanyOwnerWithTransaction(
        data: CompanyOnboardingData,
        passwordHash: string
    ): Promise<CompanyOnboardingResult> {
        return sequelize.transaction(async (transaction: Transaction) => {
            const company = await CompanyModel.create(
                {
                    name: data.name,
                    legal_name: data.legal_name,
                    tax_id: data.tax_id,
                },
                { transaction }
            );

            const owner = await UserModel.create(
                {
                    uuid_company: company.uuid_company,
                    id_card: data.owner.id_card,
                    first_name: data.owner.first_name,
                    last_name: data.owner.last_name,
                    second_last_name: data.owner.second_last_name,
                    email: data.owner.email,
                    username: data.owner.username,
                    password: passwordHash,
                    phone: data.owner.phone,
                    is_active: true,
                },
                { transaction }
            );

            const defaultRanch = await RanchModel.create(
                {
                    uuid_company: company.uuid_company,
                    name: 'Main Ranch',
                    is_active: true,
                },
                { transaction }
            );

            await UserRanchModel.create(
                {
                    uuid_user: owner.uuid_user,
                    uuid_ranch: defaultRanch.uuid_ranch,
                    role: UserRole.SUPER_ADMIN,
                    is_active: true,
                },
                { transaction }
            );

            return {
                company: {
                    uuid_company: company.uuid_company,
                    name: company.name,
                    legal_name: company.legal_name,
                    tax_id: company.tax_id,
                },
                owner: {
                    uuid_user: owner.uuid_user,
                    uuid_company: owner.uuid_company,
                    username: owner.username,
                    email: owner.email,
                    role: UserRole.SUPER_ADMIN,
                },
                tenant_database: '',
            };
        });
    }
}

export default CompanyOnboardingRepository;
