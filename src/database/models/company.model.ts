import { Model, DataTypes } from 'sequelize';
import sequelize from '../../database';
import {CompanyAttributes, CompanyCreationAttributes} from "../../interfaces/company/company.interface";

class CompanyModel extends Model <CompanyAttributes, CompanyCreationAttributes>
    implements CompanyAttributes {
    declare uuid_company: string;
    declare name: string;
    declare legal_name?: string;
    declare tax_id?: string;
    declare is_active: boolean;
    declare created_at: Date;
    declare updated_at: Date;
}

CompanyModel.init(
    {
        uuid_company: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        legal_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        tax_id: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false,
        }
    },
    {
        sequelize,
        tableName: 'companies',
        modelName: 'Company',
        timestamps: true,
        underscored: true,
    }
);

export default CompanyModel;
