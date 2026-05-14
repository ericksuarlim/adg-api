"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAnimalLegacyModel = createAnimalLegacyModel;
const sequelize_1 = require("sequelize");
function createAnimalLegacyModel(sequelize) {
    class AnimalLegacyModel extends sequelize_1.Model {
    }
    AnimalLegacyModel.init({
        uuid_animal: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        primary_tag_number: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        secondary_tag_number: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        birthdate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
        },
        sex: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        status: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: true,
        },
        detail: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        color: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        created_at: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
        },
        updated_at: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
        },
        uuid_location: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: true,
        },
        uuid_breed: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: true,
        },
        is_active: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    }, {
        sequelize,
        tableName: 'Cattle',
        modelName: 'AnimalLegacy',
        freezeTableName: true,
        timestamps: false,
    });
    return AnimalLegacyModel;
}
