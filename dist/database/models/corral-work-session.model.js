"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCorralWorkSessionModel = createCorralWorkSessionModel;
const sequelize_1 = require("sequelize");
const corral_work_constants_1 = require("../../constants/corral-work.constants");
function createCorralWorkSessionModel(sequelize) {
    class CorralWorkSessionModel extends sequelize_1.Model {
    }
    CorralWorkSessionModel.init({
        uuid_corral_work_session: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        ranch_uuid: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
        },
        paddock_uuid: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: true,
        },
        responsible_person: {
            type: sequelize_1.DataTypes.STRING(256),
            allowNull: true,
        },
        work_date: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: false,
        },
        status: {
            type: sequelize_1.DataTypes.STRING(32),
            allowNull: false,
            defaultValue: corral_work_constants_1.CorralWorkSessionStatus.DRAFT,
        },
        notes: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
        },
        planned_medicine_uuid: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: true,
        },
        created_by: {
            type: sequelize_1.DataTypes.STRING(128),
            allowNull: true,
        },
        started_at: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
        },
        closed_at: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
        },
        is_active: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    }, {
        sequelize,
        modelName: 'corral_work_session',
        tableName: 'corral_work_sessions',
        underscored: true,
        timestamps: true,
    });
    return CorralWorkSessionModel;
}
