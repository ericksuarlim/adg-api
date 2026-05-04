import { Model, DataTypes } from 'sequelize';
import sequelize from '../../database';
import {
    ReferenceSampleAttributes,
    ReferenceSampleCreationAttributes
} from "../../interfaces/reference-sample/reference-sample.interface";

class ReferenceSampleModel extends Model<ReferenceSampleAttributes, ReferenceSampleCreationAttributes>
    implements ReferenceSampleAttributes {
    declare uuid_reference_sample: string;
    declare uuid_company: string;
    declare title: string;
    declare description?: string | null;
    declare is_active: boolean;
    declare created_at: Date;
    declare updated_at: Date;
}

ReferenceSampleModel.init(
    {
        uuid_reference_sample: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        uuid_company: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: 'reference_samples',
        modelName: 'ReferenceSample',
        underscored: true,
        timestamps: true,
    }
);

export default ReferenceSampleModel;
