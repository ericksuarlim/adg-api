import UserModel from './user.model';
import CompanyModel from './company.model';
import RanchModel from './ranch.model';
import RoleModel from './role.model';
import UserRanchModel from './user-ranch.model';

CompanyModel.hasMany(RanchModel, {
    foreignKey: 'company_id',
    as: 'ranches',
});

RanchModel.belongsTo(CompanyModel, {
    foreignKey: 'company_id',
    as: 'company',
});

CompanyModel.hasMany(UserModel, {
    foreignKey: 'company_id',
    as: 'users',
});

UserModel.belongsTo(CompanyModel, {
    foreignKey: 'company_id',
    as: 'company',
});

UserModel.hasMany(UserRanchModel, {
    foreignKey: 'user_id',
    as: 'ranch_memberships',
});

UserRanchModel.belongsTo(UserModel, {
    foreignKey: 'user_id',
    as: 'user',
});

RanchModel.hasMany(UserRanchModel, {
    foreignKey: 'ranch_id',
    as: 'users',
});

UserRanchModel.belongsTo(RanchModel, {
    foreignKey: 'ranch_id',
    as: 'ranch',
});

RoleModel.hasMany(UserRanchModel, {
    foreignKey: 'role_id',
    as: 'assignments',
});

UserRanchModel.belongsTo(RoleModel, {
    foreignKey: 'role_id',
    as: 'role',
});

export {
    UserModel,
    CompanyModel,
    RanchModel,
    RoleModel,
    UserRanchModel,
};
