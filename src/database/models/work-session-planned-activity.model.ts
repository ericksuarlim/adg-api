import { DataTypes, Model, ModelStatic, Sequelize } from 'sequelize';
import {
    WorkSessionPlannedActivityAttributes,
    WorkSessionPlannedActivityCreationAttributes,
} from '../../interfaces/work-session/work-session-planned-activity.interface';

export function createWorkSessionPlannedActivityModel(
    sequelize: Sequelize
): ModelStatic<Model<WorkSessionPlannedActivityAttributes, WorkSessionPlannedActivityCreationAttributes>> {
    class WorkSessionPlannedActivityModel extends Model<
        WorkSessionPlannedActivityAttributes,
        WorkSessionPlannedActivityCreationAttributes
    > implements WorkSessionPlannedActivityAttributes {
        declare uuid_work_session_planned_activity: string;
        declare uuid_corral_work_session: string;
        declare activity_type: WorkSessionPlannedActivityAttributes['activity_type'];
        declare is_active: boolean;
        declare created_at?: Date;
        declare updated_at?: Date;
    }

    WorkSessionPlannedActivityModel.init(
        {
            uuid_work_session_planned_activity: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            uuid_corral_work_session: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            activity_type: {
                type: DataTypes.STRING(64),
                allowNull: false,
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
        },
        {
            sequelize,
            modelName: 'work_session_planned_activity',
            tableName: 'work_session_planned_activities',
            underscored: true,
            timestamps: true,
        }
    );

    return WorkSessionPlannedActivityModel as ModelStatic<
        Model<WorkSessionPlannedActivityAttributes, WorkSessionPlannedActivityCreationAttributes>
    >;
}
