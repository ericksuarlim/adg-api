import { Model, DataTypes } from 'sequelize';
import sequelize from '../../database';

class RoleModel extends Model {
    declare role_id: number;
    declare name: string;
    declare description?: string;
}

RoleModel.init(
    {
        role_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },

        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'roles',
        modelName: 'Role',
        timestamps: false,
    }
);

export default RoleModel;
