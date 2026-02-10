import { Model, DataTypes } from 'sequelize';
import sequelize from '../../database';
import { UserAttributes, UserCreationAttributes } from "../../interfaces/user/user.interface";

class UserModel extends Model <UserAttributes, UserCreationAttributes>
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

UserModel.init(
    {
        uuid_user: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        id_card: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        names: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        first_last_name: {
            type: DataTypes.STRING,
            allowNull: false,
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
            allowNull: false,
        },
        user_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password_hash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role_id: {
            type: DataTypes.INTEGER,
            defaultValue: "Admin",
            allowNull: false,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'user',
        freezeTableName: true,
        timestamps: false,
    }
);

export default UserModel;
