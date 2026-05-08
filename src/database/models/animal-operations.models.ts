import { DataTypes, Model, ModelAttributes, ModelStatic } from "sequelize";
import sequelize from "../../database";

const defaultModelOptions = {
    sequelize,
    timestamps: true,
    underscored: true,
};

function initOperationalModel<T extends Model>(
    model: ModelStatic<T>,
    attributes: ModelAttributes,
    tableName: string,
    modelName: string
) {
    model.init(attributes, {
        ...defaultModelOptions,
        tableName,
        modelName,
    });
}

export class WorkOrderModel extends Model {}
initOperationalModel(
    WorkOrderModel,
    {
        work_order_uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        ranch_uuid: { type: DataTypes.UUID, allowNull: false },
        work_date: { type: DataTypes.DATE, allowNull: false },
        work_type: { type: DataTypes.STRING, allowNull: false },
        performed_by: { type: DataTypes.STRING, allowNull: true },
        description: { type: DataTypes.TEXT, allowNull: true },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    'work_orders',
    'WorkOrder'
);

export class WorkOrderAnimalModel extends Model {}
initOperationalModel(
    WorkOrderAnimalModel,
    {
        work_order_animal_uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        work_order_uuid: { type: DataTypes.UUID, allowNull: false },
        animal_uuid: { type: DataTypes.UUID, allowNull: false },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    'work_order_animals',
    'WorkOrderAnimal'
);

export class MilkingSessionModel extends Model {}
initOperationalModel(
    MilkingSessionModel,
    {
        milking_session_uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        ranch_uuid: { type: DataTypes.UUID, allowNull: false },
        milking_date: { type: DataTypes.DATE, allowNull: false },
        shift: { type: DataTypes.STRING, allowNull: true },
        description: { type: DataTypes.TEXT, allowNull: true },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    'milking_sessions',
    'MilkingSession'
);

export class MilkRecordModel extends Model {}
initOperationalModel(
    MilkRecordModel,
    {
        milk_record_uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        milking_session_uuid: { type: DataTypes.UUID, allowNull: false },
        animal_uuid: { type: DataTypes.UUID, allowNull: false },
        liters_produced: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        milk_quality: { type: DataTypes.STRING, allowNull: true },
        description: { type: DataTypes.TEXT, allowNull: true },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    'milk_records',
    'MilkRecord'
);

export class AnimalPurchaseModel extends Model {}
initOperationalModel(
    AnimalPurchaseModel,
    {
        animal_purchase_uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        animal_uuid: { type: DataTypes.UUID, allowNull: false },
        purchase_date: { type: DataTypes.DATE, allowNull: false },
        seller_name: { type: DataTypes.STRING, allowNull: true },
        purchase_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
        currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
        origin_ranch: { type: DataTypes.STRING, allowNull: true },
        description: { type: DataTypes.TEXT, allowNull: true },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    'animal_purchases',
    'AnimalPurchase'
);

export class AnimalSaleModel extends Model {}
initOperationalModel(
    AnimalSaleModel,
    {
        animal_sale_uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        animal_uuid: { type: DataTypes.UUID, allowNull: false },
        sale_date: { type: DataTypes.DATE, allowNull: false },
        buyer_name: { type: DataTypes.STRING, allowNull: true },
        sale_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
        currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
        destination: { type: DataTypes.STRING, allowNull: true },
        description: { type: DataTypes.TEXT, allowNull: true },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    'animal_sales',
    'AnimalSale'
);

export class AnimalDisposalModel extends Model {}
initOperationalModel(
    AnimalDisposalModel,
    {
        animal_disposal_uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        animal_uuid: { type: DataTypes.UUID, allowNull: false },
        disposal_date: { type: DataTypes.DATE, allowNull: false },
        disposal_type: { type: DataTypes.STRING, allowNull: false },
        reason: { type: DataTypes.STRING, allowNull: true },
        description: { type: DataTypes.TEXT, allowNull: true },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    'animal_disposals',
    'AnimalDisposal'
);

export class InventoryItemModel extends Model {}
initOperationalModel(
    InventoryItemModel,
    {
        inventory_item_uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        ranch_uuid: { type: DataTypes.UUID, allowNull: false },
        name: { type: DataTypes.STRING, allowNull: false },
        category: { type: DataTypes.STRING, allowNull: true },
        quantity: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
        unit_of_measure: { type: DataTypes.STRING, allowNull: false },
        expiration_date: { type: DataTypes.DATE, allowNull: true },
        description: { type: DataTypes.TEXT, allowNull: true },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    'inventory_items',
    'InventoryItem'
);

export class PregnancyCheckModel extends Model {}
initOperationalModel(
    PregnancyCheckModel,
    {
        pregnancy_check_uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        female_animal_uuid: { type: DataTypes.UUID, allowNull: false },
        check_date: { type: DataTypes.DATE, allowNull: false },
        result: { type: DataTypes.STRING, allowNull: false },
        estimated_pregnancy_days: { type: DataTypes.INTEGER, allowNull: true },
        description: { type: DataTypes.TEXT, allowNull: true },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    'pregnancy_checks',
    'PregnancyCheck'
);

export class AbortionModel extends Model {}
initOperationalModel(
    AbortionModel,
    {
        abortion_uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        female_animal_uuid: { type: DataTypes.UUID, allowNull: false },
        abortion_date: { type: DataTypes.DATE, allowNull: false },
        estimated_pregnancy_month: { type: DataTypes.INTEGER, allowNull: true },
        possible_cause: { type: DataTypes.STRING, allowNull: true },
        description: { type: DataTypes.TEXT, allowNull: true },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    'abortions',
    'Abortion'
);

export class HealthCampaignModel extends Model {}
initOperationalModel(
    HealthCampaignModel,
    {
        health_campaign_uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        ranch_uuid: { type: DataTypes.UUID, allowNull: false },
        campaign_date: { type: DataTypes.DATE, allowNull: false },
        performed_by: { type: DataTypes.STRING, allowNull: true },
        description: { type: DataTypes.TEXT, allowNull: true },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    'health_campaigns',
    'HealthCampaign'
);

export class HealthCampaignTreatmentModel extends Model {}
initOperationalModel(
    HealthCampaignTreatmentModel,
    {
        health_campaign_treatment_uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        health_campaign_uuid: { type: DataTypes.UUID, allowNull: false },
        medicine_uuid: { type: DataTypes.UUID, allowNull: false },
        treatment_type: { type: DataTypes.STRING, allowNull: true },
        dose: { type: DataTypes.STRING, allowNull: true },
        application_method: { type: DataTypes.STRING, allowNull: true },
        description: { type: DataTypes.TEXT, allowNull: true },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    'health_campaign_treatments',
    'HealthCampaignTreatment'
);

export class HealthCampaignAnimalModel extends Model {}
initOperationalModel(
    HealthCampaignAnimalModel,
    {
        health_campaign_animal_uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        health_campaign_uuid: { type: DataTypes.UUID, allowNull: false },
        animal_uuid: { type: DataTypes.UUID, allowNull: false },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    'health_campaign_animals',
    'HealthCampaignAnimal'
);

export class MedicineModel extends Model {}
initOperationalModel(
    MedicineModel,
    {
        medicine_uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        name: { type: DataTypes.STRING, allowNull: false },
        medicine_type: { type: DataTypes.STRING, allowNull: true },
        batch_number: { type: DataTypes.STRING, allowNull: true },
        expiration_date: { type: DataTypes.DATE, allowNull: true },
        supplier: { type: DataTypes.STRING, allowNull: true },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    'medicines',
    'Medicine'
);

export class InseminationModel extends Model {}
initOperationalModel(
    InseminationModel,
    {
        insemination_uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        female_animal_uuid: { type: DataTypes.UUID, allowNull: false },
        insemination_date: { type: DataTypes.DATE, allowNull: false },
        semen_code: { type: DataTypes.STRING, allowNull: true },
        bull_name: { type: DataTypes.STRING, allowNull: true },
        bull_breed: { type: DataTypes.STRING, allowNull: true },
        semen_supplier: { type: DataTypes.STRING, allowNull: true },
        technician_name: { type: DataTypes.STRING, allowNull: true },
        insemination_method: { type: DataTypes.STRING, allowNull: true },
        description: { type: DataTypes.TEXT, allowNull: true },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    'inseminations',
    'Insemination'
);

export class NaturalBreedingSeasonModel extends Model {}
initOperationalModel(
    NaturalBreedingSeasonModel,
    {
        natural_breeding_season_uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        ranch_uuid: { type: DataTypes.UUID, allowNull: false },
        season_name: { type: DataTypes.STRING, allowNull: false },
        start_date: { type: DataTypes.DATE, allowNull: false },
        end_date: { type: DataTypes.DATE, allowNull: true },
        description: { type: DataTypes.TEXT, allowNull: true },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    'natural_breeding_seasons',
    'NaturalBreedingSeason'
);

export class NaturalBreedingBullModel extends Model {}
initOperationalModel(
    NaturalBreedingBullModel,
    {
        natural_breeding_bull_uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        natural_breeding_season_uuid: { type: DataTypes.UUID, allowNull: false },
        bull_animal_uuid: { type: DataTypes.UUID, allowNull: false },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    'natural_breeding_bulls',
    'NaturalBreedingBull'
);

export class NaturalBreedingFemaleModel extends Model {}
initOperationalModel(
    NaturalBreedingFemaleModel,
    {
        natural_breeding_female_uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        natural_breeding_season_uuid: { type: DataTypes.UUID, allowNull: false },
        female_animal_uuid: { type: DataTypes.UUID, allowNull: false },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    'natural_breeding_females',
    'NaturalBreedingFemale'
);

export class RanchProductionTypeModel extends Model {}
initOperationalModel(
    RanchProductionTypeModel,
    {
        ranch_production_type_uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        ranch_uuid: { type: DataTypes.UUID, allowNull: false },
        production_type: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    'ranch_production_types',
    'RanchProductionType'
);

export class PaddockModel extends Model {}
initOperationalModel(
    PaddockModel,
    {
        paddock_uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        ranch_uuid: { type: DataTypes.UUID, allowNull: false },
        name: { type: DataTypes.STRING, allowNull: false },
        size_in_hectares: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
        grass_type: { type: DataTypes.STRING, allowNull: true },
        water_source: { type: DataTypes.STRING, allowNull: true },
        maximum_capacity: { type: DataTypes.INTEGER, allowNull: true },
        status: { type: DataTypes.STRING, allowNull: true },
        description: { type: DataTypes.TEXT, allowNull: true },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    'paddocks',
    'Paddock'
);

export class AnimalMovementModel extends Model {}
initOperationalModel(
    AnimalMovementModel,
    {
        animal_movement_uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        animal_uuid: { type: DataTypes.UUID, allowNull: false },
        origin_paddock_uuid: { type: DataTypes.UUID, allowNull: true },
        destination_paddock_uuid: { type: DataTypes.UUID, allowNull: true },
        movement_date: { type: DataTypes.DATE, allowNull: false },
        movement_reason: { type: DataTypes.STRING, allowNull: true },
        description: { type: DataTypes.TEXT, allowNull: true },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    'animal_movements',
    'AnimalMovement'
);

export class OwnerModel extends Model {}
initOperationalModel(
    OwnerModel,
    {
        owner_uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        full_name: { type: DataTypes.STRING, allowNull: false },
        document_number: { type: DataTypes.STRING, allowNull: true },
        phone_number: { type: DataTypes.STRING, allowNull: true },
        email: { type: DataTypes.STRING, allowNull: true },
        address: { type: DataTypes.STRING, allowNull: true },
        description: { type: DataTypes.TEXT, allowNull: true },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    'owners',
    'Owner'
);

export class AnimalOwnerTransferModel extends Model {}
initOperationalModel(
    AnimalOwnerTransferModel,
    {
        animal_owner_transfer_uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        animal_uuid: { type: DataTypes.UUID, allowNull: false },
        previous_owner_uuid: { type: DataTypes.UUID, allowNull: true },
        new_owner_uuid: { type: DataTypes.UUID, allowNull: true },
        transfer_date: { type: DataTypes.DATE, allowNull: false },
        transfer_reason: { type: DataTypes.STRING, allowNull: true },
        sale_price: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
        currency: { type: DataTypes.STRING(3), allowNull: true },
        description: { type: DataTypes.TEXT, allowNull: true },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    'animal_owner_transfers',
    'AnimalOwnerTransfer'
);

export class AnimalIdentificationModel extends Model {}
initOperationalModel(
    AnimalIdentificationModel,
    {
        animal_identification_uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        animal_uuid: { type: DataTypes.UUID, allowNull: false },
        ranch_uuid: { type: DataTypes.UUID, allowNull: false },
        identification_type: {
            type: DataTypes.ENUM(
                'ear_tag',
                'rfid',
                'brand',
                'tattoo',
                'temporary_birth_mark',
                'visual_identifier'
            ),
            allowNull: false
        },
        identification_number: { type: DataTypes.STRING, allowNull: false },
        is_temporary: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        assigned_date: { type: DataTypes.DATE, allowNull: false },
        expiration_date: { type: DataTypes.DATE, allowNull: true },
        status: { type: DataTypes.STRING, allowNull: true },
        description: { type: DataTypes.TEXT, allowNull: true },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    'animal_identifications',
    'AnimalIdentification'
);

export class WeightRecordModel extends Model {}
initOperationalModel(
    WeightRecordModel,
    {
        weight_record_uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        animal_uuid: { type: DataTypes.UUID, allowNull: false },
        weight: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        weight_date: { type: DataTypes.DATE, allowNull: false },
        animal_age_in_days: { type: DataTypes.INTEGER, allowNull: true },
        description: { type: DataTypes.TEXT, allowNull: true },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    'weight_records',
    'WeightRecord'
);

export class BirthModel extends Model {}
initOperationalModel(
    BirthModel,
    {
        birth_uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        mother_animal_uuid: { type: DataTypes.UUID, allowNull: false },
        father_animal_uuid: { type: DataTypes.UUID, allowNull: true },
        newborn_animal_uuid: { type: DataTypes.UUID, allowNull: true },
        birth_date: { type: DataTypes.DATE, allowNull: false },
        birth_weight: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
        sex: { type: DataTypes.STRING, allowNull: true },
        birth_type: { type: DataTypes.STRING, allowNull: true },
        birth_status: { type: DataTypes.STRING, allowNull: true },
        temporary_identifier: { type: DataTypes.STRING, allowNull: true },
        description: { type: DataTypes.TEXT, allowNull: true },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    'births',
    'Birth'
);
