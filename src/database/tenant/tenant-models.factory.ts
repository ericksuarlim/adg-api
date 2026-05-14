import { Sequelize } from 'sequelize';
import { createRanchModel } from '../models/ranch.model';
import { createAnimalModel } from '../models/animal.model';
import { createAnimalLegacyModel } from '../models/animal-legacy.model';
import { createAnimalWorkSessionModel } from '../models/animal-work-session.model';
import { createOperationalModels } from '../models/animal-operations.models';
import { associateTenantDomainModels, TenantDomainModels } from './tenant-domain-associations';

export function buildTenantModelsForSequelize(sequelize: Sequelize): TenantDomainModels {
    const RanchModel = createRanchModel(sequelize);
    const AnimalModel = createAnimalModel(sequelize);
    const AnimalLegacyModel = createAnimalLegacyModel(sequelize);
    const AnimalWorkSessionModel = createAnimalWorkSessionModel(sequelize);
    const ops = createOperationalModels(sequelize);
    const merged = {
        RanchModel,
        AnimalModel,
        AnimalLegacyModel,
        AnimalWorkSessionModel,
        ...ops,
    };
    associateTenantDomainModels(merged as TenantDomainModels);
    return merged as TenantDomainModels;
}

export type { TenantDomainModels } from './tenant-domain-associations';
