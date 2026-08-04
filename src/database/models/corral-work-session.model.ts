import { DataTypes, Model, ModelStatic, Sequelize } from 'sequelize';
import {
    CorralWorkSessionAttributes,
    CorralWorkSessionCreationAttributes,
} from '../../interfaces/corral-session/corral-session.interface';
import { CorralWorkSessionStatus } from '../../constants/corral-work.constants';

export function createCorralWorkSessionModel(
    sequelize: Sequelize
): ModelStatic<Model<CorralWorkSessionAttributes, CorralWorkSessionCreationAttributes>> {
    class CorralWorkSessionModel extends Model<CorralWorkSessionAttributes, CorralWorkSessionCreationAttributes>
        implements CorralWorkSessionAttributes {
        declare uuid_corral_work_session: string;
        declare ranch_uuid: string;
        declare paddock_uuid?: string | null;
        declare responsible_person?: string | null;
        declare work_date: Date;
        declare status: CorralWorkSessionStatus;
        declare notes?: string | null;
        declare planned_medicine_uuid?: string | null;
        declare created_by?: string | null;
        declare started_at?: Date | null;
        declare closed_at?: Date | null;
        declare is_active: boolean;
        declare created_at?: Date;
        declare updated_at?: Date;
    }

    CorralWorkSessionModel.init(
        {
            uuid_corral_work_session: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            ranch_uuid: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            paddock_uuid: {
                type: DataTypes.UUID,
                allowNull: true,
            },
            responsible_person: {
                type: DataTypes.STRING(256),
                allowNull: true,
            },
            work_date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            status: {
                type: DataTypes.STRING(32),
                allowNull: false,
                defaultValue: CorralWorkSessionStatus.DRAFT,
            },
            notes: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            planned_medicine_uuid: {
                type: DataTypes.UUID,
                allowNull: true,
            },
            created_by: {
                type: DataTypes.STRING(128),
                allowNull: true,
            },
            started_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            closed_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
        },
        {
            sequelize,
            modelName: 'corral_work_session',
            tableName: 'corral_work_sessions',
            underscored: true,
            timestamps: true,
        }
    );

    return CorralWorkSessionModel as ModelStatic<
        Model<CorralWorkSessionAttributes, CorralWorkSessionCreationAttributes>
    >;
}
