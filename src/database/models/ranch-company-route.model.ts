import { Model, DataTypes } from 'sequelize';
import sequelize from '../../database';
import {
    RanchCompanyRouteAttributes,
    RanchCompanyRouteCreationAttributes,
} from '../../interfaces/ranch/ranch-company-route.interface';

/**
 * SaaS-side routing index: maps a ranch UUID (data lives in a tenant DB) to its owning company.
 * Enables SaaS owners and middleware to resolve tenant database without scanning all tenants.
 * No Sequelize association to tenant Ranch rows (different physical database).
 */
class RanchCompanyRouteModel extends Model<RanchCompanyRouteAttributes, RanchCompanyRouteCreationAttributes>
    implements RanchCompanyRouteAttributes {
    declare uuid_ranch: string;
    declare uuid_company: string;
    declare created_at?: Date;
    declare updated_at?: Date;
}

RanchCompanyRouteModel.init(
    {
        uuid_ranch: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
        },
        uuid_company: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'ranch_company_route',
        modelName: 'RanchCompanyRoute',
        timestamps: true,
        underscored: true,
    }
);

export default RanchCompanyRouteModel;
