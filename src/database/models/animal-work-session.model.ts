import { Model, DataTypes, ModelStatic, Sequelize } from 'sequelize';
import {
    AnimalWorkSessionAttributes,
    AnimalWorkSessionCreationAttributes,
} from '../../interfaces/work-session/animal-work-session.interface';

export function createAnimalWorkSessionModel(
    sequelize: Sequelize
): ModelStatic<Model<AnimalWorkSessionAttributes, AnimalWorkSessionCreationAttributes>> {
    class AnimalWorkSessionModel extends Model<AnimalWorkSessionAttributes, AnimalWorkSessionCreationAttributes>
        implements AnimalWorkSessionAttributes {
        declare id_animal_work: number;
        declare uuid_corral_work_session: string;
        declare uuid_animal: string;
        declare attended: boolean;
        declare condition: string;
        declare observation: string;
        declare received_medical: boolean;
        declare medicine_uuid?: string | null;
        declare created_at: Date;
        declare is_active: boolean;
    }

    AnimalWorkSessionModel.init(
        {
            id_animal_work: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            uuid_corral_work_session: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            uuid_animal: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            attended: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            condition: {
                type: DataTypes.STRING(100),
                allowNull: false,
                defaultValue: '',
            },
            observation: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            received_medical: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            medicine_uuid: {
                type: DataTypes.UUID,
                allowNull: true,
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
        },
        {
            sequelize,
            modelName: 'animal_work_session',
            timestamps: false,
            freezeTableName: true,
            tableName: 'animal_work_session',
        }
    );

    return AnimalWorkSessionModel as ModelStatic<Model<AnimalWorkSessionAttributes, AnimalWorkSessionCreationAttributes>>;
}
