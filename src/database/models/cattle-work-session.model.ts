import { Model, DataTypes } from 'sequelize';
import sequelize from '../../database/index';
import {
    CattleWorkSessionAttributes,
    CattleWorkSessionCreationAttributes
} from "../../interfaces/work-session/cattle-work-session.interface";

class CattleWorkSessionModel extends Model<CattleWorkSessionAttributes, CattleWorkSessionCreationAttributes>
    implements CattleWorkSessionAttributes {
    declare id_cattle_work: number;
    declare c: string;
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
        condition: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        observation: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        id_health_service: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'cattle_work_session',
        timestamps: false,
    }
);

export default CattleWorkSessionModel;
