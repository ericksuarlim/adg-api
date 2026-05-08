import { Model, DataTypes } from 'sequelize';
import sequelize from '../../database';
import { AnimalLegacyAttributes, AnimalLegacyCreationAttributes } from "../../interfaces/animal/animal-legacy.interface";

class AnimalLegacyModel extends Model<AnimalLegacyAttributes, AnimalLegacyCreationAttributes> implements AnimalLegacyAttributes {
    declare uuid_animal: string;
    declare primary_tag_number?: string | null;
    declare secondary_tag_number?: string | null;
    declare birthdate?: Date | null;
    declare sex?: string | null;
    declare status?: boolean | null;
    declare color?: string | null;
    declare detail?: string | null;
    declare created_at?: Date;
    declare updated_at?: Date;
    declare uuid_breed?: string | null;
    declare uuid_location?: string | null;
    declare is_active: boolean;
}

AnimalLegacyModel.init(
    {
        uuid_animal: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        primary_tag_number: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        secondary_tag_number: {
            type: DataTypes.STRING,
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
            type: DataTypes.UUID,
            allowNull: true,
        },
        uuid_breed: {
            type: DataTypes.UUID,
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
        tableName: 'Cattle',
        modelName: 'AnimalLegacy',
        freezeTableName: true,
        timestamps: false,
    }
);

export default AnimalLegacyModel;
