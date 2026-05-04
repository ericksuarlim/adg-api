import { DataTypes, Model } from "sequelize";
import sequelize from "../../database";
import {
    CompanyPaymentAttributes,
    CompanyPaymentCreationAttributes
} from "../../interfaces/company/company-payment.interface";

class CompanyPaymentModel extends Model<CompanyPaymentAttributes, CompanyPaymentCreationAttributes>
    implements CompanyPaymentAttributes {
    declare uuid_company_payment: string;
    declare uuid_company: string;
    declare amount: number;
    declare currency: string;
    declare payment_method: string;
    declare payment_reference?: string | null;
    declare notes?: string | null;
    declare paid_at: Date;
    declare period_start?: Date | null;
    declare period_end?: Date | null;
    declare plan_type: 'BASIC' | 'PROFESSIONAL' | 'PREMIUM';
    declare billing_cycle: 'MONTHLY' | 'ANNUAL';
    declare status: 'POSTED' | 'VOIDED';
    declare is_active: boolean;
    declare created_at: Date;
    declare updated_at: Date;
}

CompanyPaymentModel.init(
    {
        uuid_company_payment: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        uuid_company: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        amount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
        },
        currency: {
            type: DataTypes.STRING(3),
            allowNull: false,
            defaultValue: 'USD',
        },
        payment_method: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        payment_reference: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        paid_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        period_start: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        period_end: {
            type: DataTypes.DATE,
            allowNull: true,
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
        status: {
            type: DataTypes.ENUM('POSTED', 'VOIDED'),
            allowNull: false,
            defaultValue: 'POSTED',
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: 'company_payments',
        modelName: 'CompanyPayment',
        timestamps: true,
        underscored: true,
    }
);

export default CompanyPaymentModel;
