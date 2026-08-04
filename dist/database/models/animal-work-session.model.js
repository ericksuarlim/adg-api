"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAnimalWorkSessionModel = createAnimalWorkSessionModel;
const sequelize_1 = require("sequelize");
function createAnimalWorkSessionModel(sequelize) {
    class AnimalWorkSessionModel extends sequelize_1.Model {
    }
    AnimalWorkSessionModel.init({
        id_animal_work: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        uuid_corral_work_session: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
        },
        uuid_animal: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
        },
        attended: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        condition: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            defaultValue: '',
        },
        observation: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
        },
        received_medical: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        medicine_uuid: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: true,
        },
        created_at: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
        },
        is_active: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    }, {
        sequelize,
        modelName: 'animal_work_session',
        timestamps: false,
        freezeTableName: true,
        tableName: 'animal_work_session',
    });
    return AnimalWorkSessionModel;
}
