import { Optional } from 'sequelize';

export interface RanchCompanyRouteAttributes {
    uuid_ranch: string;
    uuid_company: string;
    created_at?: Date;
    updated_at?: Date;
}

export type RanchCompanyRouteCreationAttributes = Optional<
    RanchCompanyRouteAttributes,
    'created_at' | 'updated_at'
>;
