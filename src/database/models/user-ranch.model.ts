import { Model, DataTypes } from 'sequelize';
import sequelize from '../../database';
import {UserRanchAttributes, UserRanchCreationAttributes} from "../../interfaces/ranch/user-ranch.interface";

class UserRanchModel extends Model <UserRanchAttributes, UserRanchCreationAttributes>
    implements UserRanchAttributes {
    declare user_ranch_id: string;
    declare uuid_user: string;
    declare uuid_ranch: string;
    declare role_id: number;
    declare is_active: boolean;
}

UserRanchModel.init(
    {
        user_ranch_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        uuid_user: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        uuid_ranch: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        role_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: 'user_ranches',
        modelName: 'UserRanchRanch',
        timestamps: true,
        underscored: true,
    }
);

export default UserRanchModel;
