"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../../database"));
const roles_interface_1 = require("../../interfaces/roles/roles.interface");
class UserModel extends sequelize_1.Model {
}
UserModel.init({
    uuid_user: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    uuid_company: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    id_card: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    first_name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    last_name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    second_last_name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    phone: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    username: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    is_active: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    role: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: roles_interface_1.UserRole.RANCH_STAFF,
        validate: {
            isIn: [Object.values(roles_interface_1.UserRole)],
        },
    },
}, {
    sequelize: database_1.default,
    tableName: 'users',
    modelName: 'User',
    underscored: true,
    timestamps: true,
});
exports.default = UserModel;
