"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../../database"));
class ReferenceSampleModel extends sequelize_1.Model {
}
ReferenceSampleModel.init({
    uuid_reference_sample: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    uuid_company: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    is_active: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    sequelize: database_1.default,
    tableName: 'reference_samples',
    modelName: 'ReferenceSample',
    underscored: true,
    timestamps: true,
});
exports.default = ReferenceSampleModel;
