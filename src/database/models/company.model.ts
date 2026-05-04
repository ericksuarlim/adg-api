import { Model, DataTypes } from 'sequelize';
import sequelize from '../../database';
import {CompanyAttributes, CompanyCreationAttributes} from "../../interfaces/company/company.interface";

class CompanyModel extends Model <CompanyAttributes, CompanyCreationAttributes>
    implements CompanyAttributes {
    declare uuid_company: string;
    declare name: string;
    declare legal_name?: string;
    declare tax_id?: string;
    declare plan_type: 'BASIC' | 'PROFESSIONAL' | 'PREMIUM';
    declare billing_cycle: 'MONTHLY' | 'ANNUAL';
    declare membership_status: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED';
    declare membership_started_at?: Date | null;
    declare membership_renewal_at?: Date | null;
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
            unique: true,
        },
        plan_type: {
            type: DataTypes.ENUM('BASIC', 'PROFESSIONAL', 'PREMIUM'),
            allowNull: false,
            defaultValue: 'BASIC',
        },
        billing_cycle: {
            type: DataTypes.ENUM('MONTHLY', 'ANNUAL'),
            allowNull: false,
            defaultValue: 'MONTHLY',
        },
        membership_status: {
            type: DataTypes.ENUM('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELLED'),
            allowNull: false,
            defaultValue: 'TRIAL',
        },
        membership_started_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        membership_renewal_at: {
            type: DataTypes.DATE,
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
