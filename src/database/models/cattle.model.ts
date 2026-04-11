import { Model, DataTypes } from 'sequelize';
import sequelize from '../../database';
import { CattleAttributes, CattleCreationAttributes } from "../../interfaces/cattle/cattle.interface";

class Cattle extends Model <CattleAttributes, CattleCreationAttributes> implements CattleAttributes {
    declare uuid_cattle: number;
    declare primary_tag_number: string;
    declare secondary_tag_number: string;
    declare birthdate: Date;
    declare sex: string;
    declare status: boolean;
    declare color: string;
    declare detail: string;
    declare created_at: Date;
    declare updated_at: Date;
    declare uuid_breed: number;
    declare uuid_location: number;
    declare is_active: boolean;
}

Cattle.init(
    {
        uuid_cattle: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        primary_tag_number: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        secondary_tag_number: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        birthdate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        sex: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        detail: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        color: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        uuid_location: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        uuid_breed: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        }
    },
    {
        sequelize,
        modelName: 'Cattle',
        freezeTableName: true,
        timestamps: false,
    }
);

export default Cattle;
