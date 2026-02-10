import { Model, DataTypes } from 'sequelize';
import sequelize from '../../database/index';
import {
    CattleWorkSessionAttributes,
    CattleWorkSessionCreationAttributes
} from "../../interfaces/work-session/cattle-work-session.interface";

class CattleWorkSessionModel extends Model<CattleWorkSessionAttributes, CattleWorkSessionCreationAttributes>
    implements CattleWorkSessionAttributes {
    declare id_cattle_work: number;
    declare uuid_cattle: string;
    declare work_session_id: string;
    declare attended: boolean;
    declare condition: string;
    declare observation: string;
    declare received_medical: boolean;
    declare created_at: Date;
}

CattleWorkSessionModel.init(
    {
        id_cattle_work: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        uuid_cattle: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        work_session_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        attended: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        condition: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        observation: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        received_medical: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: 'cattle_work_session',
        timestamps: false,
        freezeTableName: true,
    }
);

export default CattleWorkSessionModel;
