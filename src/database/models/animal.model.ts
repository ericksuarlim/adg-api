import { DataTypes, Model } from "sequelize";
import sequelize from "../../database";
import { AnimalAttributes, AnimalCreationAttributes } from "../../interfaces/animal/animal.interface";

class AnimalModel extends Model<AnimalAttributes, AnimalCreationAttributes> implements AnimalAttributes {
    declare animal_uuid: string;
    declare ranch_uuid: string;
    declare breed_code: string;
    declare registration_number: string;
    declare mother_animal_uuid?: string | null;
    declare father_animal_uuid?: string | null;
    declare current_owner_uuid?: string | null;
    declare sex: 'MALE' | 'FEMALE';
    declare color?: string | null;
    declare birth_date: Date;
    declare origin_type: 'BIRTH' | 'PURCHASE' | 'TRANSFER' | 'UNKNOWN';
    declare current_status: 'ACTIVE' | 'SOLD' | 'DISPOSED' | 'DEAD' | 'MISSING' | 'INACTIVE';
    declare description?: string | null;
    declare current_paddock_uuid?: string | null;
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
        ranch_uuid: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        breed_code: {
            type: DataTypes.STRING(64),
            allowNull: false,
            defaultValue: 'UNKNOWN',
        },
        registration_number: {
            type: DataTypes.STRING(128),
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
            defaultValue: 'MALE',
        },
        color: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        birth_date: {
            type: DataTypes.DATE,
            allowNull: false,
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
