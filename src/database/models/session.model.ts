import { Model, DataTypes } from 'sequelize';
import sequelize from '../../database/index';
import { SessionAttributes, SessionCreationAttributes } from "../../interfaces/session/session.interface";

class SessionModel extends Model<SessionAttributes, SessionCreationAttributes>
    implements SessionAttributes {
    public uuid_session!: number;
    public user_name?: string;
    public user_token?: string;
    public active?: boolean;
    public login_date?: Date;
}

SessionModel.init(
    {
        uuid_session: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        user_token: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        login_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'Session',
        freezeTableName: true,
        timestamps: false,
    }
);

export default SessionModel;
