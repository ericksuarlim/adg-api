"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const index_1 = __importDefault(require("../../database/index"));
class SessionModel extends sequelize_1.Model {
}
SessionModel.init({
    uuid_session: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    user_name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    user_token: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    is_active: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    login_date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
}, {
    sequelize: index_1.default,
    tableName: 'sessions',
    modelName: 'Session',
    underscored: true,
    timestamps: true,
});
exports.default = SessionModel;
