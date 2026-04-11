import { Model, DataTypes } from 'sequelize';
import sequelize from '../../database';
import {RanchAttributes, RanchCreationAttributes} from "../../interfaces/ranch/ranch.interface";

class RanchModel extends Model <RanchAttributes, RanchCreationAttributes>
    implements RanchAttributes {
    declare uuid_ranch: string;
    declare uuid_company: string;
    declare name: string;
    declare location?: string;
    declare area?: string;
    declare is_active: boolean;
    declare created_at: Date;
    declare updated_at: Date;
}

RanchModel.init(
    {
        uuid_ranch: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        uuid_company: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        location: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        area: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'ranches',
        modelName: 'Ranch',
        timestamps: true,
        underscored: true,
    }
);

export default RanchModel;
