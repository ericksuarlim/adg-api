"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const tenant_request_context_1 = require("../database/tenant/tenant-request-context");
class CorralSessionRepository {
    async findAllSessions(params) {
        const { CorralWorkSessionModel } = (0, tenant_request_context_1.requireTenantModels)();
        const { page, size, order } = params;
        const where = { is_active: true };
        if (params.ranch_uuid)
            where.ranch_uuid = params.ranch_uuid;
        if (params.status)
            where.status = params.status;
        if (params.work_date)
            where.work_date = params.work_date;
        const sortColumn = params.sortBy === 'work_date' ? 'work_date' : 'created_at';
        return CorralWorkSessionModel.findAndCountAll({
            where,
            offset: (page - 1) * size,
            limit: size,
            order: [[sortColumn, order]],
        });
    }
    async findSessionById(uuid) {
        const { CorralWorkSessionModel } = (0, tenant_request_context_1.requireTenantModels)();
        return CorralWorkSessionModel.findOne({ where: { uuid_corral_work_session: uuid, is_active: true } });
    }
    async createSession(data) {
        const { CorralWorkSessionModel } = (0, tenant_request_context_1.requireTenantModels)();
        return CorralWorkSessionModel.create(data);
    }
    async updateSession(uuid, data) {
        const { CorralWorkSessionModel } = (0, tenant_request_context_1.requireTenantModels)();
        const [count, rows] = await CorralWorkSessionModel.update(data, {
            where: { uuid_corral_work_session: uuid, is_active: true },
            returning: true,
        });
        return count > 0 ? rows[0] : null;
    }
    async findStepsWithActivities(sessionUuid) {
        const { CorralSessionStepModel, CorralStepActivityModel } = (0, tenant_request_context_1.requireTenantModels)();
        const steps = await CorralSessionStepModel.findAll({
            where: { uuid_corral_work_session: sessionUuid, is_active: true },
            order: [['step_order', 'ASC']],
        });
        const result = [];
        for (const row of steps) {
            const step = row.get({ plain: true });
            const activityRows = await CorralStepActivityModel.findAll({
                where: { uuid_corral_session_step: step.uuid_corral_session_step, is_active: true },
            });
            result.push({
                step,
                activities: activityRows.map((a) => a.get('activity_code')),
            });
        }
        return result;
    }
    async createStep(sessionUuid, stepOrder, label) {
        const { CorralSessionStepModel } = (0, tenant_request_context_1.requireTenantModels)();
        return CorralSessionStepModel.create({
            uuid_corral_work_session: sessionUuid,
            step_order: stepOrder,
            label: label ?? `Step ${stepOrder}`,
        });
    }
    async createStepActivity(stepUuid, activityCode) {
        const { CorralStepActivityModel } = (0, tenant_request_context_1.requireTenantModels)();
        await CorralStepActivityModel.create({
            uuid_corral_session_step: stepUuid,
            activity_code: activityCode,
        });
    }
    async createSource(data) {
        const { CorralSessionSourceModel } = (0, tenant_request_context_1.requireTenantModels)();
        await CorralSessionSourceModel.create({ ...data, is_active: true });
    }
    async findSources(sessionUuid) {
        const { CorralSessionSourceModel } = (0, tenant_request_context_1.requireTenantModels)();
        const rows = await CorralSessionSourceModel.findAll({
            where: { uuid_corral_work_session: sessionUuid, is_active: true },
        });
        return rows.map((r) => r.get({ plain: true }));
    }
    async bulkCreateSessionAnimals(animals) {
        const { CorralSessionAnimalModel } = (0, tenant_request_context_1.requireTenantModels)();
        if (animals.length === 0)
            return;
        await CorralSessionAnimalModel.bulkCreate(animals.map((a) => ({ ...a, attended: false, is_active: true })));
    }
    async findSessionAnimals(sessionUuid) {
        const { CorralSessionAnimalModel } = (0, tenant_request_context_1.requireTenantModels)();
        const rows = await CorralSessionAnimalModel.findAll({
            where: { uuid_corral_work_session: sessionUuid, is_active: true },
            order: [['registration_number', 'ASC']],
        });
        return rows.map((r) => r.get({ plain: true }));
    }
    async findActivityRecordsForStep(sessionUuid, stepUuid) {
        const { CorralActivityRecordModel } = (0, tenant_request_context_1.requireTenantModels)();
        const rows = await CorralActivityRecordModel.findAll({
            where: {
                uuid_corral_work_session: sessionUuid,
                uuid_corral_session_step: stepUuid,
                is_active: true,
            },
        });
        return rows.map((r) => r.get({ plain: true }));
    }
    async upsertActivityRecord(payload) {
        const { CorralActivityRecordModel } = (0, tenant_request_context_1.requireTenantModels)();
        const existing = await CorralActivityRecordModel.findOne({
            where: {
                uuid_corral_work_session: payload.uuid_corral_work_session,
                uuid_corral_session_step: payload.uuid_corral_session_step,
                animal_uuid: payload.animal_uuid,
                activity_code: payload.activity_code,
                is_active: true,
            },
        });
        if (existing) {
            await existing.update({
                bool_value: payload.bool_value,
                numeric_value: payload.numeric_value,
                text_value: payload.text_value,
                medicine_uuid: payload.medicine_uuid,
                dose: payload.dose,
                unit: payload.unit,
                identification_type: payload.identification_type,
                weight_record_uuid: payload.weight_record_uuid,
            });
            return existing.get({ plain: true });
        }
        const created = await CorralActivityRecordModel.create({ ...payload, is_active: true });
        return created.get({ plain: true });
    }
    async updateSessionAnimalAttendance(sessionUuid, animalUuid, attended) {
        const { CorralSessionAnimalModel } = (0, tenant_request_context_1.requireTenantModels)();
        await CorralSessionAnimalModel.update({ attended }, { where: { uuid_corral_work_session: sessionUuid, animal_uuid: animalUuid, is_active: true } });
    }
    async resolveAnimalsForSources(ranchUuid, paddockUuids, filters, manualUuids) {
        const { AnimalModel } = (0, tenant_request_context_1.requireTenantModels)();
        const where = {
            ranch_uuid: ranchUuid,
            is_active: true,
            current_status: 'ACTIVE',
        };
        const orClauses = [];
        if (paddockUuids.length > 0) {
            orClauses.push({ current_paddock_uuid: { [sequelize_1.Op.in]: paddockUuids } });
        }
        for (const filter of filters) {
            const key = filter.filter_key.trim().toLowerCase();
            const value = filter.filter_value.trim();
            if (key === 'sex' && (value === 'MALE' || value === 'FEMALE')) {
                orClauses.push({ sex: value });
            }
            else if (key === 'breed_code') {
                orClauses.push({ breed_code: value });
            }
            else if (key === 'origin_type') {
                orClauses.push({ origin_type: value });
            }
        }
        if (manualUuids.length > 0) {
            orClauses.push({ animal_uuid: { [sequelize_1.Op.in]: manualUuids } });
        }
        if (orClauses.length === 0) {
            return [];
        }
        const rows = await AnimalModel.findAll({
            where: { ...where, [sequelize_1.Op.or]: orClauses },
            attributes: ['animal_uuid', 'registration_number', 'chip_number'],
        });
        const map = new Map();
        for (const row of rows) {
            const plain = row.get({ plain: true });
            map.set(plain.animal_uuid, plain);
        }
        return [...map.values()].sort((a, b) => a.registration_number.localeCompare(b.registration_number));
    }
    async findAnimalInRanchByIdentifier(ranchUuid, identifier) {
        const { AnimalModel } = (0, tenant_request_context_1.requireTenantModels)();
        const trimmed = identifier.trim();
        const row = await AnimalModel.findOne({
            where: {
                ranch_uuid: ranchUuid,
                is_active: true,
                current_status: 'ACTIVE',
                [sequelize_1.Op.or]: [
                    { registration_number: trimmed },
                    { chip_number: trimmed },
                ],
            },
            attributes: ['animal_uuid', 'registration_number', 'chip_number'],
        });
        return row ? row.get({ plain: true }) : null;
    }
    async upsertObservation(sessionUuid, animalUuid, stepUuid, text) {
        const { CorralAnimalObservationModel } = (0, tenant_request_context_1.requireTenantModels)();
        await CorralAnimalObservationModel.update({ is_active: false }, { where: { uuid_corral_work_session: sessionUuid, animal_uuid: animalUuid, is_active: true } });
        await CorralAnimalObservationModel.create({
            uuid_corral_work_session: sessionUuid,
            uuid_corral_session_step: stepUuid ?? null,
            animal_uuid: animalUuid,
            observation_text: text,
            is_active: true,
        });
    }
    async upsertVisualCondition(sessionUuid, animalUuid, stepUuid, conditionCode) {
        const { CorralAnimalVisualConditionModel } = (0, tenant_request_context_1.requireTenantModels)();
        await CorralAnimalVisualConditionModel.update({ is_active: false }, { where: { uuid_corral_work_session: sessionUuid, animal_uuid: animalUuid, is_active: true } });
        await CorralAnimalVisualConditionModel.create({
            uuid_corral_work_session: sessionUuid,
            uuid_corral_session_step: stepUuid ?? null,
            animal_uuid: animalUuid,
            condition_code: conditionCode,
            is_active: true,
        });
    }
    async replaceAdditionalMedications(sessionUuid, animalUuid, stepUuid, items) {
        const { CorralAnimalAdditionalMedicationModel } = (0, tenant_request_context_1.requireTenantModels)();
        await CorralAnimalAdditionalMedicationModel.update({ is_active: false }, { where: { uuid_corral_work_session: sessionUuid, animal_uuid: animalUuid, is_active: true } });
        for (const item of items) {
            await CorralAnimalAdditionalMedicationModel.create({
                uuid_corral_work_session: sessionUuid,
                uuid_corral_session_step: stepUuid ?? null,
                animal_uuid: animalUuid,
                product_name: item.product_name,
                medicine_uuid: item.medicine_uuid ?? null,
                dose: item.dose ?? null,
                unit: item.unit ?? null,
                is_active: true,
            });
        }
    }
    async replaceAdditionalTreatments(sessionUuid, animalUuid, stepUuid, items) {
        const { CorralAnimalAdditionalTreatmentModel } = (0, tenant_request_context_1.requireTenantModels)();
        await CorralAnimalAdditionalTreatmentModel.update({ is_active: false }, { where: { uuid_corral_work_session: sessionUuid, animal_uuid: animalUuid, is_active: true } });
        for (const item of items) {
            await CorralAnimalAdditionalTreatmentModel.create({
                uuid_corral_work_session: sessionUuid,
                uuid_corral_session_step: stepUuid ?? null,
                animal_uuid: animalUuid,
                treatment_type: item.treatment_type,
                description: item.description ?? null,
                is_active: true,
            });
        }
    }
    async countFindings(sessionUuid) {
        const { CorralAnimalObservationModel, CorralAnimalVisualConditionModel, CorralAnimalAdditionalMedicationModel, CorralAnimalAdditionalTreatmentModel, } = (0, tenant_request_context_1.requireTenantModels)();
        const [o, v, m, t] = await Promise.all([
            CorralAnimalObservationModel.count({ where: { uuid_corral_work_session: sessionUuid, is_active: true } }),
            CorralAnimalVisualConditionModel.count({ where: { uuid_corral_work_session: sessionUuid, is_active: true } }),
            CorralAnimalAdditionalMedicationModel.count({ where: { uuid_corral_work_session: sessionUuid, is_active: true } }),
            CorralAnimalAdditionalTreatmentModel.count({ where: { uuid_corral_work_session: sessionUuid, is_active: true } }),
        ]);
        return o + v + m + t;
    }
}
exports.default = CorralSessionRepository;
