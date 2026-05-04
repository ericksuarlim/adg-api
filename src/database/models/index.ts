import UserModel from './user.model';
import CompanyModel from './company.model';
import RanchModel from './ranch.model';
import UserRanchModel from './user-ranch.model';
import ReferenceSampleModel from './reference-sample.model';
import CompanyPaymentModel from "./company-payment.model";

CompanyModel.hasMany(RanchModel, {
    foreignKey: 'uuid_company',
    as: 'ranches',
});

CompanyModel.hasMany(UserModel, {
    foreignKey: 'uuid_company',
    as: 'users',
});

UserModel.belongsTo(CompanyModel, {
    foreignKey: 'uuid_company',
    as: 'company',
});

RanchModel.belongsTo(CompanyModel, {
    foreignKey: 'uuid_company',
    as: 'company',
});

UserModel.hasMany(UserRanchModel, {
    foreignKey: 'uuid_user',
    as: 'ranch_memberships',
});

UserRanchModel.belongsTo(UserModel, {
    foreignKey: 'uuid_user',
    as: 'user',
});

RanchModel.hasMany(UserRanchModel, {
    foreignKey: 'uuid_ranch',
    as: 'users',
});

UserRanchModel.belongsTo(RanchModel, {
    foreignKey: 'uuid_ranch',
    as: 'ranch',
});

CompanyModel.hasMany(ReferenceSampleModel, {
    foreignKey: 'uuid_company',
    as: 'reference_samples',
});

ReferenceSampleModel.belongsTo(CompanyModel, {
    foreignKey: 'uuid_company',
    as: 'company',
});

CompanyModel.hasMany(CompanyPaymentModel, {
    foreignKey: 'uuid_company',
    as: 'payments',
});

CompanyPaymentModel.belongsTo(CompanyModel, {
    foreignKey: 'uuid_company',
    as: 'company',
});

export {
    UserModel,
    CompanyModel,
    RanchModel,
    UserRanchModel,
    ReferenceSampleModel,
    CompanyPaymentModel,
};
