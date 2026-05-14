"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRanchModel = createRanchModel;
const sequelize_1 = require("sequelize");
function createRanchModel(sequelize) {
    class RanchModel extends sequelize_1.Model {
    }
    RanchModel.init({
        uuid_ranch: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        uuid_company: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
        },
        name: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        location: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        area: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        is_active: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: true,
        },
    }, {
        sequelize,
        tableName: 'ranches',
        modelName: 'Ranch',
        timestamps: true,
        underscored: true,
    });
    return RanchModel;
}
