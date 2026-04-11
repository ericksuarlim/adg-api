import { Model, DataTypes } from 'sequelize';
import sequelize from '../../database';
import { UserAttributes, UserCreationAttributes } from "../../interfaces/user/user.interface";

class UserModel extends Model <UserAttributes, UserCreationAttributes>
    implements UserAttributes {
    declare uuid_user: string;
    declare company_id: string;

    declare id_card: string;
    declare first_name: string;
    declare last_name: string;
    declare second_last_name?: string | null;

    declare email: string;
    declare username: string;
    declare password: string;

    declare phone?: string | null;
    declare is_active: boolean;

    declare created_at: Date;
    declare updated_at: Date;
}

UserModel.init(
    {
        uuid_user: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        company_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        id_card: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        second_last_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
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
        tableName: 'users',
        modelName: 'User',
        underscored: true,
        timestamps: true,
    }
);

export default UserModel;
