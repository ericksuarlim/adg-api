"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../database"));
const models_1 = require("../database/models");
const roles_interface_1 = require("../interfaces/roles/roles.interface");
class CompanyOnboardingRepository {
    async existsByTaxId(taxId) {
        if (!taxId) {
            return false;
        }
        const company = await models_1.CompanyModel.findOne({ where: { tax_id: taxId } });
        return Boolean(company);
    }
    async existsByUsername(username) {
        const user = await models_1.UserModel.findOne({ where: { username } });
        return Boolean(user);
    }
    async existsByEmail(email) {
        const user = await models_1.UserModel.findOne({ where: { email } });
        return Boolean(user);
    }
    async createCompanyOwnerWithTransaction(data, passwordHash) {
        return database_1.default.transaction(async (transaction) => {
            const company = await models_1.CompanyModel.create({
                name: data.name,
                legal_name: data.legal_name,
                tax_id: data.tax_id,
            }, { transaction });
            const owner = await models_1.UserModel.create({
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
                role: roles_interface_1.UserRole.ADMINISTRATOR,
            }, { transaction });
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
                    role: roles_interface_1.UserRole.ADMINISTRATOR,
                },
                tenant_database: '',
            };
        });
    }
}
exports.default = CompanyOnboardingRepository;
