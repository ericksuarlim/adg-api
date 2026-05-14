"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../../database"));
/**
 * SaaS-side routing index: maps a ranch UUID (data lives in a tenant DB) to its owning company.
 * Enables SaaS owners and middleware to resolve tenant database without scanning all tenants.
 * No Sequelize association to tenant Ranch rows (different physical database).
 */
class RanchCompanyRouteModel extends sequelize_1.Model {
}
RanchCompanyRouteModel.init({
    uuid_ranch: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
    },
    uuid_company: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
}, {
    sequelize: database_1.default,
    tableName: 'ranch_company_route',
    modelName: 'RanchCompanyRoute',
    timestamps: true,
    underscored: true,
});
exports.default = RanchCompanyRouteModel;
