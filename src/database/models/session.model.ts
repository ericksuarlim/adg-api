import { Model, DataTypes } from 'sequelize';
import sequelize from '../../database/index';
import { SessionAttributes, SessionCreationAttributes } from "../../interfaces/session/session.interface";

class SessionModel extends Model<SessionAttributes, SessionCreationAttributes>
    implements SessionAttributes {
    declare uuid_session: number;
    declare user_name: string;
    declare user_token: string;
    declare is_active: boolean;
    declare login_date: Date;
}

SessionModel.init(
    {
        uuid_session: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        user_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        user_token: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        login_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'sessions',
        modelName: 'Session',
        underscored: true,
        timestamps: true,
    }
);

export default SessionModel;
