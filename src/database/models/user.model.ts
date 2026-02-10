import { Model, DataTypes } from 'sequelize';
import sequelize from '../../database';
import { UserAttributes, UserCreationAttributes } from "../../interfaces/user/user.model.interface";

class User extends Model <UserAttributes, UserCreationAttributes>
    implements UserAttributes {
    declare uuid_user: number;
    declare id_card: number;
    declare names: string;
    declare first_last_name: string;
    declare second_last_name: string;
    declare cell_phone: number;
    declare email: string;
    declare user_name: string;
    declare password: string;
    declare role: string;
    declare is_active: boolean;
}

User.init(
    {
        uuid_user: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        id_card: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        names: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        first_last_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        second_last_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        cell_phone: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        user_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        role: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'User',
        freezeTableName: true,
        timestamps: false,
    }
);

export default User;
