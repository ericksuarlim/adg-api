import UserModel from './user.model';
import CompanyModel from './company.model';
import SessionModel from './session.model';
import RanchModel from './ranch.model';
import UserRanchModel from './user-ranch.model';
import ReferenceSampleModel from './reference-sample.model';
import CompanyPaymentModel from "./company-payment.model";
import AnimalLegacyModel from "./animal-legacy.model";
import AnimalModel from "./animal.model";
import {
    AbortionModel,
    AnimalDisposalModel,
    AnimalIdentificationModel,
    AnimalMovementModel,
    AnimalOwnerTransferModel,
    AnimalPurchaseModel,
    AnimalSaleModel,
    BirthModel,
    HealthCampaignAnimalModel,
    HealthCampaignModel,
    HealthCampaignTreatmentModel,
    InseminationModel,
    InventoryItemModel,
    MedicineModel,
    MilkRecordModel,
    MilkingSessionModel,
    NaturalBreedingBullModel,
    NaturalBreedingFemaleModel,
    NaturalBreedingSeasonModel,
    OwnerModel,
    PaddockModel,
    PregnancyCheckModel,
    RanchProductionTypeModel,
    WeightRecordModel,
    WorkOrderAnimalModel,
    WorkOrderModel
} from "./animal-operations.models";

CompanyModel.hasMany(RanchModel, {
    foreignKey: 'uuid_company',
    as: 'ranches',
});

CompanyModel.hasMany(UserModel, {
    foreignKey: 'uuid_company',
    as: 'users',
});

UserModel.belongsTo(CompanyModel, {
    foreignKey: 'uuid_company',
    as: 'company',
});

RanchModel.belongsTo(CompanyModel, {
    foreignKey: 'uuid_company',
    as: 'company',
});

RanchModel.hasMany(AnimalModel, {
    foreignKey: 'ranch_uuid',
    as: 'animals',
});

AnimalModel.belongsTo(RanchModel, {
    foreignKey: 'ranch_uuid',
    as: 'ranch',
});

CompanyModel.hasMany(AnimalModel, {
    foreignKey: 'uuid_company',
    as: 'animals',
});

AnimalModel.belongsTo(CompanyModel, {
    foreignKey: 'uuid_company',
    as: 'company',
});

AnimalModel.belongsTo(AnimalModel, {
    foreignKey: 'mother_animal_uuid',
    as: 'mother',
});

AnimalModel.belongsTo(AnimalModel, {
    foreignKey: 'father_animal_uuid',
    as: 'father',
});

AnimalModel.hasMany(AnimalModel, {
    foreignKey: 'mother_animal_uuid',
    as: 'children_as_mother',
});

AnimalModel.hasMany(AnimalModel, {
    foreignKey: 'father_animal_uuid',
    as: 'children_as_father',
});

OwnerModel.hasMany(AnimalModel, {
    foreignKey: 'current_owner_uuid',
    as: 'owned_animals',
});

AnimalModel.belongsTo(OwnerModel, {
    foreignKey: 'current_owner_uuid',
    as: 'current_owner',
});

PaddockModel.hasMany(AnimalModel, {
    foreignKey: 'current_paddock_uuid',
    as: 'current_animals',
});

AnimalModel.belongsTo(PaddockModel, {
    foreignKey: 'current_paddock_uuid',
    as: 'current_paddock',
});

RanchModel.hasMany(AnimalLegacyModel, {
    foreignKey: 'uuid_location',
    as: 'legacy_animals',
});

AnimalLegacyModel.belongsTo(RanchModel, {
    foreignKey: 'uuid_location',
    as: 'ranch',
});

RanchModel.hasMany(WorkOrderModel, {
    foreignKey: 'ranch_uuid',
    as: 'work_orders',
});

WorkOrderModel.belongsTo(RanchModel, {
    foreignKey: 'ranch_uuid',
    as: 'ranch',
});

WorkOrderModel.hasMany(WorkOrderAnimalModel, {
    foreignKey: 'work_order_uuid',
    as: 'work_order_animals',
});

WorkOrderAnimalModel.belongsTo(WorkOrderModel, {
    foreignKey: 'work_order_uuid',
    as: 'work_order',
});

AnimalModel.hasMany(WorkOrderAnimalModel, {
    foreignKey: 'animal_uuid',
    as: 'work_orders_links',
});

WorkOrderAnimalModel.belongsTo(AnimalModel, {
    foreignKey: 'animal_uuid',
    as: 'animal',
});

RanchModel.hasMany(MilkingSessionModel, {
    foreignKey: 'ranch_uuid',
    as: 'milking_sessions',
});

MilkingSessionModel.belongsTo(RanchModel, {
    foreignKey: 'ranch_uuid',
    as: 'ranch',
});

MilkingSessionModel.hasMany(MilkRecordModel, {
    foreignKey: 'milking_session_uuid',
    as: 'milk_records',
});

MilkRecordModel.belongsTo(MilkingSessionModel, {
    foreignKey: 'milking_session_uuid',
    as: 'milking_session',
});

AnimalModel.hasMany(MilkRecordModel, {
    foreignKey: 'animal_uuid',
    as: 'milk_records',
});

MilkRecordModel.belongsTo(AnimalModel, {
    foreignKey: 'animal_uuid',
    as: 'animal',
});

AnimalModel.hasMany(AnimalPurchaseModel, {
    foreignKey: 'animal_uuid',
    as: 'purchases',
});

AnimalPurchaseModel.belongsTo(AnimalModel, {
    foreignKey: 'animal_uuid',
    as: 'animal',
});

AnimalModel.hasMany(AnimalSaleModel, {
    foreignKey: 'animal_uuid',
    as: 'sales',
});

AnimalSaleModel.belongsTo(AnimalModel, {
    foreignKey: 'animal_uuid',
    as: 'animal',
});

AnimalModel.hasMany(AnimalDisposalModel, {
    foreignKey: 'animal_uuid',
    as: 'disposals',
});

AnimalDisposalModel.belongsTo(AnimalModel, {
    foreignKey: 'animal_uuid',
    as: 'animal',
});

RanchModel.hasMany(InventoryItemModel, {
    foreignKey: 'ranch_uuid',
    as: 'inventory_items',
});

InventoryItemModel.belongsTo(RanchModel, {
    foreignKey: 'ranch_uuid',
    as: 'ranch',
});

RanchModel.hasMany(NaturalBreedingSeasonModel, {
    foreignKey: 'ranch_uuid',
    as: 'natural_breeding_seasons',
});

NaturalBreedingSeasonModel.belongsTo(RanchModel, {
    foreignKey: 'ranch_uuid',
    as: 'ranch',
});

NaturalBreedingSeasonModel.hasMany(NaturalBreedingBullModel, {
    foreignKey: 'natural_breeding_season_uuid',
    as: 'bulls',
});

NaturalBreedingBullModel.belongsTo(NaturalBreedingSeasonModel, {
    foreignKey: 'natural_breeding_season_uuid',
    as: 'season',
});

NaturalBreedingSeasonModel.hasMany(NaturalBreedingFemaleModel, {
    foreignKey: 'natural_breeding_season_uuid',
    as: 'females',
});

NaturalBreedingFemaleModel.belongsTo(NaturalBreedingSeasonModel, {
    foreignKey: 'natural_breeding_season_uuid',
    as: 'season',
});

AnimalModel.hasMany(NaturalBreedingBullModel, {
    foreignKey: 'bull_animal_uuid',
    as: 'natural_breeding_seasons_as_bull',
});

NaturalBreedingBullModel.belongsTo(AnimalModel, {
    foreignKey: 'bull_animal_uuid',
    as: 'bull',
});

AnimalModel.hasMany(NaturalBreedingFemaleModel, {
    foreignKey: 'female_animal_uuid',
    as: 'natural_breeding_seasons_as_female',
});

NaturalBreedingFemaleModel.belongsTo(AnimalModel, {
    foreignKey: 'female_animal_uuid',
    as: 'female',
});

AnimalModel.hasMany(PregnancyCheckModel, {
    foreignKey: 'female_animal_uuid',
    as: 'pregnancy_checks',
});

PregnancyCheckModel.belongsTo(AnimalModel, {
    foreignKey: 'female_animal_uuid',
    as: 'female_animal',
});

AnimalModel.hasMany(AbortionModel, {
    foreignKey: 'female_animal_uuid',
    as: 'abortions',
});

AbortionModel.belongsTo(AnimalModel, {
    foreignKey: 'female_animal_uuid',
    as: 'female_animal',
});

RanchModel.hasMany(HealthCampaignModel, {
    foreignKey: 'ranch_uuid',
    as: 'health_campaigns',
});

HealthCampaignModel.belongsTo(RanchModel, {
    foreignKey: 'ranch_uuid',
    as: 'ranch',
});

HealthCampaignModel.hasMany(HealthCampaignTreatmentModel, {
    foreignKey: 'health_campaign_uuid',
    as: 'treatments',
});

HealthCampaignTreatmentModel.belongsTo(HealthCampaignModel, {
    foreignKey: 'health_campaign_uuid',
    as: 'health_campaign',
});

MedicineModel.hasMany(HealthCampaignTreatmentModel, {
    foreignKey: 'medicine_uuid',
    as: 'campaign_treatments',
});

HealthCampaignTreatmentModel.belongsTo(MedicineModel, {
    foreignKey: 'medicine_uuid',
    as: 'medicine',
});

HealthCampaignModel.hasMany(HealthCampaignAnimalModel, {
    foreignKey: 'health_campaign_uuid',
    as: 'animals',
});

HealthCampaignAnimalModel.belongsTo(HealthCampaignModel, {
    foreignKey: 'health_campaign_uuid',
    as: 'health_campaign',
});

AnimalModel.hasMany(HealthCampaignAnimalModel, {
    foreignKey: 'animal_uuid',
    as: 'health_campaigns_links',
});

HealthCampaignAnimalModel.belongsTo(AnimalModel, {
    foreignKey: 'animal_uuid',
    as: 'animal',
});

AnimalModel.hasMany(InseminationModel, {
    foreignKey: 'female_animal_uuid',
    as: 'inseminations',
});

InseminationModel.belongsTo(AnimalModel, {
    foreignKey: 'female_animal_uuid',
    as: 'female_animal',
});

RanchModel.hasMany(RanchProductionTypeModel, {
    foreignKey: 'ranch_uuid',
    as: 'production_types',
});

RanchProductionTypeModel.belongsTo(RanchModel, {
    foreignKey: 'ranch_uuid',
    as: 'ranch',
});

RanchModel.hasMany(PaddockModel, {
    foreignKey: 'ranch_uuid',
    as: 'paddocks',
});

PaddockModel.belongsTo(RanchModel, {
    foreignKey: 'ranch_uuid',
    as: 'ranch',
});

AnimalModel.hasMany(AnimalMovementModel, {
    foreignKey: 'animal_uuid',
    as: 'movements',
});

AnimalMovementModel.belongsTo(AnimalModel, {
    foreignKey: 'animal_uuid',
    as: 'animal',
});

PaddockModel.hasMany(AnimalMovementModel, {
    foreignKey: 'origin_paddock_uuid',
    as: 'origin_movements',
});

AnimalMovementModel.belongsTo(PaddockModel, {
    foreignKey: 'origin_paddock_uuid',
    as: 'origin_paddock',
});

PaddockModel.hasMany(AnimalMovementModel, {
    foreignKey: 'destination_paddock_uuid',
    as: 'destination_movements',
});

AnimalMovementModel.belongsTo(PaddockModel, {
    foreignKey: 'destination_paddock_uuid',
    as: 'destination_paddock',
});

AnimalModel.hasMany(AnimalOwnerTransferModel, {
    foreignKey: 'animal_uuid',
    as: 'owner_transfers',
});

AnimalOwnerTransferModel.belongsTo(AnimalModel, {
    foreignKey: 'animal_uuid',
    as: 'animal',
});

OwnerModel.hasMany(AnimalOwnerTransferModel, {
    foreignKey: 'previous_owner_uuid',
    as: 'transfers_as_previous_owner',
});

AnimalOwnerTransferModel.belongsTo(OwnerModel, {
    foreignKey: 'previous_owner_uuid',
    as: 'previous_owner',
});

OwnerModel.hasMany(AnimalOwnerTransferModel, {
    foreignKey: 'new_owner_uuid',
    as: 'transfers_as_new_owner',
});

AnimalOwnerTransferModel.belongsTo(OwnerModel, {
    foreignKey: 'new_owner_uuid',
    as: 'new_owner',
});

AnimalModel.hasMany(AnimalIdentificationModel, {
    foreignKey: 'animal_uuid',
    as: 'identifications',
});

AnimalIdentificationModel.belongsTo(AnimalModel, {
    foreignKey: 'animal_uuid',
    as: 'animal',
});

RanchModel.hasMany(AnimalIdentificationModel, {
    foreignKey: 'ranch_uuid',
    as: 'animal_identifications',
});

AnimalIdentificationModel.belongsTo(RanchModel, {
    foreignKey: 'ranch_uuid',
    as: 'ranch',
});

AnimalModel.hasMany(WeightRecordModel, {
    foreignKey: 'animal_uuid',
    as: 'weight_records',
});

WeightRecordModel.belongsTo(AnimalModel, {
    foreignKey: 'animal_uuid',
    as: 'animal',
});

AnimalModel.hasMany(BirthModel, {
    foreignKey: 'mother_animal_uuid',
    as: 'births_as_mother',
});

BirthModel.belongsTo(AnimalModel, {
    foreignKey: 'mother_animal_uuid',
    as: 'mother_animal',
});

AnimalModel.hasMany(BirthModel, {
    foreignKey: 'father_animal_uuid',
    as: 'births_as_father',
});

BirthModel.belongsTo(AnimalModel, {
    foreignKey: 'father_animal_uuid',
    as: 'father_animal',
});

AnimalModel.hasMany(BirthModel, {
    foreignKey: 'newborn_animal_uuid',
    as: 'birth_events_as_newborn',
});

BirthModel.belongsTo(AnimalModel, {
    foreignKey: 'newborn_animal_uuid',
    as: 'newborn_animal',
});

UserModel.hasMany(UserRanchModel, {
    foreignKey: 'uuid_user',
    as: 'ranch_memberships',
});

UserRanchModel.belongsTo(UserModel, {
    foreignKey: 'uuid_user',
    as: 'user',
});

RanchModel.hasMany(UserRanchModel, {
    foreignKey: 'uuid_ranch',
    as: 'users',
});

UserRanchModel.belongsTo(RanchModel, {
    foreignKey: 'uuid_ranch',
    as: 'ranch',
});

CompanyModel.hasMany(ReferenceSampleModel, {
    foreignKey: 'uuid_company',
    as: 'reference_samples',
});

ReferenceSampleModel.belongsTo(CompanyModel, {
    foreignKey: 'uuid_company',
    as: 'company',
});

CompanyModel.hasMany(CompanyPaymentModel, {
    foreignKey: 'uuid_company',
    as: 'payments',
});

CompanyPaymentModel.belongsTo(CompanyModel, {
    foreignKey: 'uuid_company',
    as: 'company',
});

export {
    SessionModel,
    UserModel,
    CompanyModel,
    RanchModel,
    UserRanchModel,
    ReferenceSampleModel,
    CompanyPaymentModel,
    AnimalLegacyModel,
    AnimalModel,
    WorkOrderModel,
    WorkOrderAnimalModel,
    MilkingSessionModel,
    MilkRecordModel,
    AnimalPurchaseModel,
    AnimalSaleModel,
    AnimalDisposalModel,
    InventoryItemModel,
    PregnancyCheckModel,
    AbortionModel,
    HealthCampaignModel,
    HealthCampaignTreatmentModel,
    HealthCampaignAnimalModel,
    MedicineModel,
    InseminationModel,
    NaturalBreedingSeasonModel,
    NaturalBreedingBullModel,
    NaturalBreedingFemaleModel,
    RanchProductionTypeModel,
    PaddockModel,
    AnimalMovementModel,
    OwnerModel,
    AnimalOwnerTransferModel,
    AnimalIdentificationModel,
    WeightRecordModel,
    BirthModel,
};
