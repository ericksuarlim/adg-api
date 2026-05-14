"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const company_model_1 = __importDefault(require("./models/company.model"));
const user_model_1 = __importDefault(require("./models/user.model"));
const user_ranch_model_1 = __importDefault(require("./models/user-ranch.model"));
const ranch_company_route_model_1 = __importDefault(require("./models/ranch-company-route.model"));
const company_payment_model_1 = __importDefault(require("./models/company-payment.model"));
const reference_sample_model_1 = __importDefault(require("./models/reference-sample.model"));
company_model_1.default.hasMany(user_model_1.default, {
    foreignKey: 'uuid_company',
    as: 'users',
});
user_model_1.default.belongsTo(company_model_1.default, {
    foreignKey: 'uuid_company',
    as: 'company',
});
company_model_1.default.hasMany(ranch_company_route_model_1.default, {
    foreignKey: 'uuid_company',
    as: 'ranch_routes',
});
ranch_company_route_model_1.default.belongsTo(company_model_1.default, {
    foreignKey: 'uuid_company',
    as: 'company',
});
user_model_1.default.hasMany(user_ranch_model_1.default, {
    foreignKey: 'uuid_user',
    as: 'ranch_memberships',
});
user_ranch_model_1.default.belongsTo(user_model_1.default, {
    foreignKey: 'uuid_user',
    as: 'user',
});
/**
 * user_ranches.uuid_ranch references operational ranches in the tenant database only logically
 * (no Sequelize cross-database FK). Roles and uuid_company are authoritative in SaaS.
 */
company_model_1.default.hasMany(company_payment_model_1.default, {
    foreignKey: 'uuid_company',
    as: 'payments',
});
company_payment_model_1.default.belongsTo(company_model_1.default, {
    foreignKey: 'uuid_company',
    as: 'company',
});
company_model_1.default.hasMany(reference_sample_model_1.default, {
    foreignKey: 'uuid_company',
    as: 'reference_samples',
});
reference_sample_model_1.default.belongsTo(company_model_1.default, {
    foreignKey: 'uuid_company',
    as: 'company',
});
