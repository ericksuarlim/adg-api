"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWorkSessionPlannedActivityModel = createWorkSessionPlannedActivityModel;
const sequelize_1 = require("sequelize");
function createWorkSessionPlannedActivityModel(sequelize) {
    class WorkSessionPlannedActivityModel extends sequelize_1.Model {
    }
    WorkSessionPlannedActivityModel.init({
        uuid_work_session_planned_activity: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        uuid_corral_work_session: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
        },
        activity_type: {
            type: sequelize_1.DataTypes.STRING(64),
            allowNull: false,
        },
        is_active: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    }, {
        sequelize,
        modelName: 'work_session_planned_activity',
        tableName: 'work_session_planned_activities',
        underscored: true,
        timestamps: true,
    });
    return WorkSessionPlannedActivityModel;
}
