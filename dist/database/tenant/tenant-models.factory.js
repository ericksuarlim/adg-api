"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTenantModelsForSequelize = buildTenantModelsForSequelize;
const ranch_model_1 = require("../models/ranch.model");
const animal_model_1 = require("../models/animal.model");
const animal_legacy_model_1 = require("../models/animal-legacy.model");
const animal_work_session_model_1 = require("../models/animal-work-session.model");
const animal_operations_models_1 = require("../models/animal-operations.models");
const tenant_domain_associations_1 = require("./tenant-domain-associations");
function buildTenantModelsForSequelize(sequelize) {
    const RanchModel = (0, ranch_model_1.createRanchModel)(sequelize);
    const AnimalModel = (0, animal_model_1.createAnimalModel)(sequelize);
    const AnimalLegacyModel = (0, animal_legacy_model_1.createAnimalLegacyModel)(sequelize);
    const AnimalWorkSessionModel = (0, animal_work_session_model_1.createAnimalWorkSessionModel)(sequelize);
    const ops = (0, animal_operations_models_1.createOperationalModels)(sequelize);
    const merged = {
        RanchModel,
        AnimalModel,
        AnimalLegacyModel,
        AnimalWorkSessionModel,
        ...ops,
    };
    (0, tenant_domain_associations_1.associateTenantDomainModels)(merged);
    return merged;
}
