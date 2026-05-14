"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../../database"));
const roles_interface_1 = require("../../interfaces/roles/roles.interface");
/**
 * SaaS membership: uuid_ranch is an opaque reference to a row in the company's tenant DB.
 * uuid_company is denormalized for auth queries without joining tenant ranches.
 * Legacy rows may have null uuid_company until backfilled (see scripts/backfill-user-ranches-uuid-company.sql).
 */
class UserRanchModel extends sequelize_1.Model {
}
UserRanchModel.init({
    user_ranch_id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    uuid_user: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    uuid_ranch: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    uuid_company: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
    },
    role: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [Object.values(roles_interface_1.UserRole)],
        },
    },
    is_active: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    sequelize: database_1.default,
    tableName: 'user_ranches',
    modelName: 'UserRanchRanch',
    timestamps: true,
    underscored: true,
});
exports.default = UserRanchModel;
