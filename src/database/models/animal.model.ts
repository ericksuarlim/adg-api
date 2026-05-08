import { DataTypes, Model } from "sequelize";
import sequelize from "../../database";
import { AnimalAttributes, AnimalCreationAttributes } from "../../interfaces/animal/animal.interface";

class AnimalModel extends Model<AnimalAttributes, AnimalCreationAttributes> implements AnimalAttributes {
    declare animal_uuid: string;
    declare uuid_company: string;
    declare ranch_uuid: string;
    declare breed_uuid: string;
    declare mother_animal_uuid?: string | null;
    declare father_animal_uuid?: string | null;
    declare current_owner_uuid?: string | null;
    declare sex: 'MALE' | 'FEMALE';
    declare color?: string | null;
    declare birth_date?: Date | null;
    declare origin_type: 'BIRTH' | 'PURCHASE' | 'TRANSFER' | 'UNKNOWN';
    declare current_status: 'ACTIVE' | 'SOLD' | 'DISPOSED' | 'DEAD' | 'MISSING' | 'INACTIVE';
    declare description?: string | null;
    declare current_paddock_uuid?: string | null;
    declare current_weight?: number | null;
    declare is_active: boolean;
    declare created_at?: Date;
    declare updated_at?: Date;
}

AnimalModel.init(
    {
        animal_uuid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        uuid_company: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        ranch_uuid: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        breed_uuid: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        mother_animal_uuid: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        father_animal_uuid: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        current_owner_uuid: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        sex: {
            type: DataTypes.ENUM('MALE', 'FEMALE'),
            allowNull: false,
        },
        color: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        birth_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        origin_type: {
            type: DataTypes.ENUM('BIRTH', 'PURCHASE', 'TRANSFER', 'UNKNOWN'),
            allowNull: false,
            defaultValue: 'UNKNOWN',
        },
        current_status: {
            type: DataTypes.ENUM('ACTIVE', 'SOLD', 'DISPOSED', 'DEAD', 'MISSING', 'INACTIVE'),
            allowNull: false,
            defaultValue: 'ACTIVE',
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        current_paddock_uuid: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        current_weight: {
            type: DataTypes.DECIMAL(10, 2),
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
        tableName: 'animals',
        modelName: 'Animal',
        timestamps: true,
        underscored: true,
    }
);

export default AnimalModel;
