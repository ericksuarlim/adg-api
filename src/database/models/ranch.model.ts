import { DataTypes, Model, ModelStatic, Sequelize } from 'sequelize';
import { RanchAttributes, RanchCreationAttributes } from '../../interfaces/ranch/ranch.interface';

export function createRanchModel(sequelize: Sequelize): ModelStatic<Model<RanchAttributes, RanchCreationAttributes>> {
    class RanchModel extends Model<RanchAttributes, RanchCreationAttributes> implements RanchAttributes {
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
        },
        {
            sequelize,
            tableName: 'ranches',
            modelName: 'Ranch',
            timestamps: true,
            underscored: true,
        }
    );

    return RanchModel as ModelStatic<Model<RanchAttributes, RanchCreationAttributes>>;
}
