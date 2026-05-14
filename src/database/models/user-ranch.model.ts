import { Model, DataTypes } from 'sequelize';
import sequelize from '../../database';
import {UserRanchAttributes, UserRanchCreationAttributes} from "../../interfaces/ranch/user-ranch.interface";
import {UserRole} from "../../interfaces/roles/roles.interface";

/**
 * SaaS membership: uuid_ranch is an opaque reference to a row in the company's tenant DB.
 * uuid_company is denormalized for auth queries without joining tenant ranches.
 * Legacy rows may have null uuid_company until backfilled (see scripts/backfill-user-ranches-uuid-company.sql).
 */
class UserRanchModel extends Model <UserRanchAttributes, UserRanchCreationAttributes>
    implements UserRanchAttributes {
    declare user_ranch_id: number;
    declare uuid_user: string;
    declare uuid_ranch: string;
    declare uuid_company?: string | null;
    declare role: UserRole;
    declare is_active: boolean;
}

UserRanchModel.init(
    {
        user_ranch_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        uuid_user: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        uuid_ranch: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        uuid_company: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: [Object.values(UserRole)],
            },
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
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
