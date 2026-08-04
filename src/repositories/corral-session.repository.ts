import { Op } from 'sequelize';
import type { Model } from 'sequelize';
import { requireTenantModels } from '../database/tenant/tenant-request-context';
import { buildAnimalIdentifierExactMatchClause } from '../utils/animal-identifier.util';
import {
    CorralWorkSessionAttributes,
    CorralWorkSessionCreationAttributes,
} from '../interfaces/corral-session/corral-session.interface';
import {
    CorralActivityCode,
    CorralSessionSourceType,
    CorralStepWorkMode,
    CorralWorkSessionStatus,
} from '../constants/corral-work.constants';
import type {
    CorralActivityRecordAttributes,
    CorralSessionAnimalAttributes,
    CorralSessionSourceAttributes,
    CorralSessionStepAttributes,
    CorralStepActivityAttributes,
} from '../interfaces/corral-session/corral-session.interface';

export interface CorralWorkSessionListParams {
    page: number;
    size: number;
    sortBy: string;
    order: 'ASC' | 'DESC';
    ranch_uuid?: string;
    status?: string;
    work_date?: string;
    activity_code?: CorralActivityCode;
}

class CorralSessionRepository {
    async findAllSessions(
        params: CorralWorkSessionListParams
    ): Promise<{ rows: Model<CorralWorkSessionAttributes>[]; count: number }> {
        const { CorralWorkSessionModel } = requireTenantModels();
        const { page, size, order } = params;
        const where: Record<string, unknown> = { is_active: true };
        if (params.ranch_uuid) where.ranch_uuid = params.ranch_uuid;
        if (params.status) where.status = params.status;
        if (params.work_date) where.work_date = params.work_date;

        if (params.activity_code) {
            const sessionUuids = await this.findSessionUuidsByActivity(params.activity_code);
            if (sessionUuids.length === 0) {
                return { rows: [], count: 0 };
            }
            where.uuid_corral_work_session = { [Op.in]: sessionUuids };
        }

        const sortColumn = params.sortBy === 'work_date' ? 'work_date' : 'created_at';
        return CorralWorkSessionModel.findAndCountAll({
            where,
            offset: (page - 1) * size,
            limit: size,
            order: [[sortColumn, order]],
        });
    }

    private async findSessionUuidsByActivity(activityCode: CorralActivityCode): Promise<string[]> {
        const { CorralSessionStepModel, CorralStepActivityModel } = requireTenantModels();
        const activityRows = await CorralStepActivityModel.findAll({
            where: { activity_code: activityCode, is_active: true },
            attributes: ['uuid_corral_session_step'],
        });
        const stepUuids = [
            ...new Set(activityRows.map((row) => row.get('uuid_corral_session_step') as string)),
        ];
        if (stepUuids.length === 0) {
            return [];
        }

        const stepRows = await CorralSessionStepModel.findAll({
            where: { uuid_corral_session_step: { [Op.in]: stepUuids }, is_active: true },
            attributes: ['uuid_corral_work_session'],
        });
        return [...new Set(stepRows.map((row) => row.get('uuid_corral_work_session') as string))];
    }

    async findSessionById(uuid: string): Promise<Model<CorralWorkSessionAttributes> | null> {
        const { CorralWorkSessionModel } = requireTenantModels();
        return CorralWorkSessionModel.findOne({ where: { uuid_corral_work_session: uuid, is_active: true } });
    }

    async createSession(data: CorralWorkSessionCreationAttributes): Promise<Model<CorralWorkSessionAttributes>> {
        const { CorralWorkSessionModel } = requireTenantModels();
        return CorralWorkSessionModel.create(data);
    }

    async updateSession(
        uuid: string,
        data: Partial<CorralWorkSessionCreationAttributes>
    ): Promise<Model<CorralWorkSessionAttributes> | null> {
        const { CorralWorkSessionModel } = requireTenantModels();
        const [count, rows] = await CorralWorkSessionModel.update(data, {
            where: { uuid_corral_work_session: uuid, is_active: true },
            returning: true,
        });
        return count > 0 ? rows[0] : null;
    }

    async findStepsWithActivities(sessionUuid: string): Promise<Array<{
        step: CorralSessionStepAttributes;
        activities: CorralActivityCode[];
    }>> {
        const { CorralSessionStepModel, CorralStepActivityModel } = requireTenantModels();
        const steps = await CorralSessionStepModel.findAll({
            where: { uuid_corral_work_session: sessionUuid, is_active: true },
            order: [['step_order', 'ASC']],
        });
        const result: Array<{ step: CorralSessionStepAttributes; activities: CorralActivityCode[] }> = [];
        for (const row of steps) {
            const step = row.get({ plain: true }) as CorralSessionStepAttributes;
            const activityRows = await CorralStepActivityModel.findAll({
                where: { uuid_corral_session_step: step.uuid_corral_session_step, is_active: true },
            });
            result.push({
                step,
                activities: activityRows.map((a) => a.get('activity_code') as CorralActivityCode),
            });
        }
        return result;
    }

    async createStep(
        sessionUuid: string,
        stepOrder: number,
        label?: string | null,
        workMode: CorralStepWorkMode = CorralStepWorkMode.PRELOADED_SEARCH
    ): Promise<Model<CorralSessionStepAttributes>> {
        const { CorralSessionStepModel } = requireTenantModels();
        return CorralSessionStepModel.create({
            uuid_corral_work_session: sessionUuid,
            step_order: stepOrder,
            label: label ?? `Step ${stepOrder}`,
            work_mode: workMode,
        });
    }

    async deactivateStepsAndActivities(sessionUuid: string): Promise<void> {
        const { CorralSessionStepModel, CorralStepActivityModel } = requireTenantModels();
        const steps = await CorralSessionStepModel.findAll({
            where: { uuid_corral_work_session: sessionUuid, is_active: true },
            attributes: ['uuid_corral_session_step'],
        });
        const stepUuids = steps.map((row) => row.get('uuid_corral_session_step') as string);
        if (stepUuids.length > 0) {
            await CorralStepActivityModel.update(
                { is_active: false },
                { where: { uuid_corral_session_step: { [Op.in]: stepUuids }, is_active: true } }
            );
        }
        await CorralSessionStepModel.update(
            { is_active: false },
            { where: { uuid_corral_work_session: sessionUuid, is_active: true } }
        );
    }

    async ensureSessionAnimal(
        sessionUuid: string,
        animal: { animal_uuid: string; registration_number: string; chip_number?: string | null },
        isExpected = false
    ): Promise<void> {
        const { CorralSessionAnimalModel } = requireTenantModels();
        const existing = await CorralSessionAnimalModel.findOne({
            where: { uuid_corral_work_session: sessionUuid, animal_uuid: animal.animal_uuid, is_active: true },
        });
        if (existing) return;
        await CorralSessionAnimalModel.create({
            uuid_corral_work_session: sessionUuid,
            animal_uuid: animal.animal_uuid,
            registration_number: animal.registration_number,
            chip_number: animal.chip_number ?? null,
            attended: false,
            is_expected: isExpected,
            is_active: true,
        });
    }

    async ensureStepAnimal(
        sessionUuid: string,
        stepUuid: string,
        animalUuid: string
    ): Promise<void> {
        const { CorralStepAnimalModel } = requireTenantModels();
        const existing = await CorralStepAnimalModel.findOne({
            where: {
                uuid_corral_session_step: stepUuid,
                animal_uuid: animalUuid,
                is_active: true,
            },
        });
        if (existing) return;
        await CorralStepAnimalModel.create({
            uuid_corral_work_session: sessionUuid,
            uuid_corral_session_step: stepUuid,
            animal_uuid: animalUuid,
            is_active: true,
        });
    }

    async findSessionAnimal(
        sessionUuid: string,
        animalUuid: string
    ): Promise<CorralSessionAnimalAttributes | null> {
        const { CorralSessionAnimalModel } = requireTenantModels();
        const row = await CorralSessionAnimalModel.findOne({
            where: { uuid_corral_work_session: sessionUuid, animal_uuid: animalUuid, is_active: true },
        });
        return row ? (row.get({ plain: true }) as CorralSessionAnimalAttributes) : null;
    }

    async updateStepWorkMode(
        stepUuid: string,
        workMode: CorralStepWorkMode
    ): Promise<void> {
        const { CorralSessionStepModel } = requireTenantModels();
        await CorralSessionStepModel.update(
            { work_mode: workMode },
            { where: { uuid_corral_session_step: stepUuid, is_active: true } }
        );
    }

    async createStepActivity(stepUuid: string, activityCode: CorralActivityCode): Promise<void> {
        const { CorralStepActivityModel } = requireTenantModels();
        await CorralStepActivityModel.create({
            uuid_corral_session_step: stepUuid,
            activity_code: activityCode,
        });
    }

    async createSource(data: Omit<CorralSessionSourceAttributes, 'uuid_corral_session_source' | 'is_active'>): Promise<void> {
        const { CorralSessionSourceModel } = requireTenantModels();
        await CorralSessionSourceModel.create({ ...data, is_active: true });
    }

    async findSources(sessionUuid: string): Promise<CorralSessionSourceAttributes[]> {
        const { CorralSessionSourceModel } = requireTenantModels();
        const rows = await CorralSessionSourceModel.findAll({
            where: { uuid_corral_work_session: sessionUuid, is_active: true },
        });
        return rows.map((r) => r.get({ plain: true }) as CorralSessionSourceAttributes);
    }

    async bulkCreateSessionAnimals(
        animals: Array<Omit<CorralSessionAnimalAttributes, 'uuid_corral_session_animal' | 'is_active' | 'attended'>>
    ): Promise<void> {
        const { CorralSessionAnimalModel } = requireTenantModels();
        if (animals.length === 0) return;
        await CorralSessionAnimalModel.bulkCreate(
            animals.map((a) => ({ ...a, attended: false, is_active: true }))
        );
    }

    async findSessionAnimals(sessionUuid: string): Promise<CorralSessionAnimalAttributes[]> {
        const { CorralSessionAnimalModel } = requireTenantModels();
        const rows = await CorralSessionAnimalModel.findAll({
            where: { uuid_corral_work_session: sessionUuid, is_active: true },
            order: [['registration_number', 'ASC']],
        });
        return rows.map((r) => r.get({ plain: true }) as CorralSessionAnimalAttributes);
    }

    async findActivityRecordsForStep(
        sessionUuid: string,
        stepUuid: string
    ): Promise<CorralActivityRecordAttributes[]> {
        const { CorralActivityRecordModel } = requireTenantModels();
        const rows = await CorralActivityRecordModel.findAll({
            where: {
                uuid_corral_work_session: sessionUuid,
                uuid_corral_session_step: stepUuid,
                is_active: true,
            },
        });
        return rows.map((r) => r.get({ plain: true }) as CorralActivityRecordAttributes);
    }

    async upsertActivityRecord(
        payload: Omit<CorralActivityRecordAttributes, 'uuid_corral_activity_record' | 'is_active' | 'created_at' | 'updated_at'>
    ): Promise<CorralActivityRecordAttributes> {
        const { CorralActivityRecordModel } = requireTenantModels();
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
            return existing.get({ plain: true }) as CorralActivityRecordAttributes;
        }
        const created = await CorralActivityRecordModel.create({ ...payload, is_active: true });
        return created.get({ plain: true }) as CorralActivityRecordAttributes;
    }

    async replaceMultiActivityRecords(
        sessionUuid: string,
        stepUuid: string,
        animalUuid: string,
        activityCode: string,
        items: Array<{
            text_value: string;
            medicine_uuid?: string | null;
            dose?: string | null;
            unit?: string | null;
        }>
    ): Promise<void> {
        const { CorralActivityRecordModel } = requireTenantModels();
        await CorralActivityRecordModel.update(
            { is_active: false },
            {
                where: {
                    uuid_corral_work_session: sessionUuid,
                    uuid_corral_session_step: stepUuid,
                    animal_uuid: animalUuid,
                    activity_code: activityCode,
                    is_active: true,
                },
            }
        );

        for (const item of items) {
            await CorralActivityRecordModel.create({
                uuid_corral_work_session: sessionUuid,
                uuid_corral_session_step: stepUuid,
                animal_uuid: animalUuid,
                activity_code: activityCode,
                bool_value: null,
                numeric_value: null,
                text_value: item.text_value,
                medicine_uuid: item.medicine_uuid ?? null,
                dose: item.dose ?? null,
                unit: item.unit ?? null,
                identification_type: null,
                weight_record_uuid: null,
                is_active: true,
            });
        }
    }

    async updateSessionAnimalAttendance(sessionUuid: string, animalUuid: string, attended: boolean): Promise<void> {
        const { CorralSessionAnimalModel } = requireTenantModels();
        await CorralSessionAnimalModel.update(
            { attended },
            { where: { uuid_corral_work_session: sessionUuid, animal_uuid: animalUuid, is_active: true } }
        );
    }

    async countSessionAnimals(sessionUuid: string): Promise<number> {
        const { CorralSessionAnimalModel } = requireTenantModels();
        return CorralSessionAnimalModel.count({
            where: { uuid_corral_work_session: sessionUuid, is_active: true },
        });
    }

    async deactivateSessionAnimals(sessionUuid: string): Promise<void> {
        const { CorralSessionAnimalModel } = requireTenantModels();
        await CorralSessionAnimalModel.update(
            { is_active: false },
            { where: { uuid_corral_work_session: sessionUuid, is_active: true } }
        );
    }

    async deactivateSessionSources(sessionUuid: string): Promise<void> {
        const { CorralSessionSourceModel } = requireTenantModels();
        await CorralSessionSourceModel.update(
            { is_active: false },
            { where: { uuid_corral_work_session: sessionUuid, is_active: true } }
        );
    }

    async deactivateStepAnimals(sessionUuid: string): Promise<void> {
        const { CorralStepAnimalModel } = requireTenantModels();
        await CorralStepAnimalModel.update(
            { is_active: false },
            { where: { uuid_corral_work_session: sessionUuid, is_active: true } }
        );
    }

    async bulkCreateStepAnimals(
        rows: Array<{
            uuid_corral_work_session: string;
            uuid_corral_session_step: string;
            animal_uuid: string;
        }>
    ): Promise<void> {
        const { CorralStepAnimalModel } = requireTenantModels();
        if (rows.length === 0) return;
        await CorralStepAnimalModel.bulkCreate(rows.map((row) => ({ ...row, is_active: true })));
    }

    async findStepAnimalUuids(stepUuid: string): Promise<Set<string>> {
        const { CorralStepAnimalModel } = requireTenantModels();
        const rows = await CorralStepAnimalModel.findAll({
            where: { uuid_corral_session_step: stepUuid, is_active: true },
            attributes: ['animal_uuid'],
        });
        return new Set(rows.map((row) => row.get('animal_uuid') as string));
    }

    async hasStepAnimalAssignments(sessionUuid: string): Promise<boolean> {
        const { CorralStepAnimalModel } = requireTenantModels();
        const count = await CorralStepAnimalModel.count({
            where: { uuid_corral_work_session: sessionUuid, is_active: true },
        });
        return count > 0;
    }

    async resolveAnimalsBySourceBreakdown(
        ranchUuid: string,
        paddockUuids: string[],
        filters: Array<{ filter_key: string; filter_value: string }>,
        manualUuids: string[]
    ): Promise<{
        merged: Array<{ animal_uuid: string; registration_number: string; chip_number?: string | null; sex?: string; breed_code?: string; current_paddock_uuid?: string | null }>;
        fromPaddocks: Set<string>;
        fromFilters: Set<string>;
        fromManual: Set<string>;
    }> {
        const { AnimalModel } = requireTenantModels();
        const baseWhere = {
            ranch_uuid: ranchUuid,
            is_active: true,
            current_status: 'ACTIVE' as const,
        };

        const fromPaddocks = new Set<string>();
        const fromFilters = new Set<string>();
        const fromManual = new Set<string>();
        const merged = new Map<string, { animal_uuid: string; registration_number: string; chip_number?: string | null; sex?: string; breed_code?: string; current_paddock_uuid?: string | null }>();

        const addRows = (
            rows: Array<{ animal_uuid: string; registration_number: string; chip_number?: string | null; sex?: string; breed_code?: string; current_paddock_uuid?: string | null }>,
            bucket: Set<string>
        ) => {
            for (const row of rows) {
                bucket.add(row.animal_uuid);
                merged.set(row.animal_uuid, row);
            }
        };

        if (paddockUuids.length > 0) {
            const rows = await AnimalModel.findAll({
                where: { ...baseWhere, current_paddock_uuid: { [Op.in]: paddockUuids } },
                attributes: ['animal_uuid', 'registration_number', 'chip_number', 'sex', 'breed_code', 'current_paddock_uuid'],
            });
            addRows(rows.map((r) => r.get({ plain: true }) as typeof merged extends Map<string, infer V> ? V : never), fromPaddocks);
        }

        for (const filter of filters) {
            const key = filter.filter_key.trim().toLowerCase();
            const value = filter.filter_value.trim();
            const filterWhere: Record<string, unknown> = { ...baseWhere };
            if (key === 'sex' && (value === 'MALE' || value === 'FEMALE')) {
                filterWhere.sex = value;
            } else if (key === 'breed_code') {
                filterWhere.breed_code = value;
            } else if (key === 'origin_type') {
                filterWhere.origin_type = value;
            } else {
                continue;
            }
            const rows = await AnimalModel.findAll({
                where: filterWhere,
                attributes: ['animal_uuid', 'registration_number', 'chip_number', 'sex', 'breed_code', 'current_paddock_uuid'],
            });
            addRows(rows.map((r) => r.get({ plain: true }) as typeof merged extends Map<string, infer V> ? V : never), fromFilters);
        }

        if (manualUuids.length > 0) {
            const rows = await AnimalModel.findAll({
                where: { ...baseWhere, animal_uuid: { [Op.in]: manualUuids } },
                attributes: ['animal_uuid', 'registration_number', 'chip_number', 'sex', 'breed_code', 'current_paddock_uuid'],
            });
            addRows(rows.map((r) => r.get({ plain: true }) as typeof merged extends Map<string, infer V> ? V : never), fromManual);
        }

        const sorted = [...merged.values()].sort((a, b) => a.registration_number.localeCompare(b.registration_number));
        return { merged: sorted, fromPaddocks, fromFilters, fromManual };
    }

    async resolveAnimalsForSources(
        ranchUuid: string,
        paddockUuids: string[],
        filters: Array<{ filter_key: string; filter_value: string }>,
        manualUuids: string[]
    ): Promise<Array<{ animal_uuid: string; registration_number: string; chip_number?: string | null }>> {
        const { merged } = await this.resolveAnimalsBySourceBreakdown(ranchUuid, paddockUuids, filters, manualUuids);
        return merged;
    }

    async findAnimalInRanchByIdentifier(
        ranchUuid: string,
        identifier: string
    ): Promise<{ animal_uuid: string; registration_number: string; chip_number?: string | null } | null> {
        const identifierClause = buildAnimalIdentifierExactMatchClause(identifier);
        if (!identifierClause) {
            return null;
        }

        const { AnimalModel } = requireTenantModels();
        const row = await AnimalModel.findOne({
            where: {
                ranch_uuid: ranchUuid,
                is_active: true,
                ...identifierClause,
            },
            attributes: ['animal_uuid', 'registration_number', 'chip_number'],
        });
        return row
            ? (row.get({ plain: true }) as {
                  animal_uuid: string;
                  registration_number: string;
                  chip_number?: string | null;
              })
            : null;
    }

    async findActiveAnimalByIdentifier(
        identifier: string
    ): Promise<{
        animal_uuid: string;
        registration_number: string;
        chip_number?: string | null;
        ranch_uuid: string;
    } | null> {
        const identifierClause = buildAnimalIdentifierExactMatchClause(identifier);
        if (!identifierClause) {
            return null;
        }

        const { AnimalModel } = requireTenantModels();
        const row = await AnimalModel.findOne({
            where: {
                is_active: true,
                ...identifierClause,
            },
            attributes: ['animal_uuid', 'registration_number', 'chip_number', 'ranch_uuid'],
        });
        return row
            ? (row.get({ plain: true }) as {
                  animal_uuid: string;
                  registration_number: string;
                  chip_number?: string | null;
                  ranch_uuid: string;
              })
            : null;
    }

    async upsertObservation(
        sessionUuid: string,
        animalUuid: string,
        stepUuid: string | null | undefined,
        text: string
    ): Promise<void> {
        const { CorralAnimalObservationModel } = requireTenantModels();
        await CorralAnimalObservationModel.update(
            { is_active: false },
            { where: { uuid_corral_work_session: sessionUuid, animal_uuid: animalUuid, is_active: true } }
        );
        await CorralAnimalObservationModel.create({
            uuid_corral_work_session: sessionUuid,
            uuid_corral_session_step: stepUuid ?? null,
            animal_uuid: animalUuid,
            observation_text: text,
            is_active: true,
        });
    }

    async upsertVisualCondition(
        sessionUuid: string,
        animalUuid: string,
        stepUuid: string | null | undefined,
        conditionCode: string
    ): Promise<void> {
        const { CorralAnimalVisualConditionModel } = requireTenantModels();
        await CorralAnimalVisualConditionModel.update(
            { is_active: false },
            { where: { uuid_corral_work_session: sessionUuid, animal_uuid: animalUuid, is_active: true } }
        );
        await CorralAnimalVisualConditionModel.create({
            uuid_corral_work_session: sessionUuid,
            uuid_corral_session_step: stepUuid ?? null,
            animal_uuid: animalUuid,
            condition_code: conditionCode,
            is_active: true,
        });
    }

    async replaceAdditionalMedications(
        sessionUuid: string,
        animalUuid: string,
        stepUuid: string | null | undefined,
        items: Array<{ product_name: string; medicine_uuid?: string | null; dose?: string | null; unit?: string | null }>
    ): Promise<void> {
        const { CorralAnimalAdditionalMedicationModel } = requireTenantModels();
        await CorralAnimalAdditionalMedicationModel.update(
            { is_active: false },
            { where: { uuid_corral_work_session: sessionUuid, animal_uuid: animalUuid, is_active: true } }
        );
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

    async replaceAdditionalTreatments(
        sessionUuid: string,
        animalUuid: string,
        stepUuid: string | null | undefined,
        items: Array<{ treatment_type: string; description?: string | null }>
    ): Promise<void> {
        const { CorralAnimalAdditionalTreatmentModel } = requireTenantModels();
        await CorralAnimalAdditionalTreatmentModel.update(
            { is_active: false },
            { where: { uuid_corral_work_session: sessionUuid, animal_uuid: animalUuid, is_active: true } }
        );
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

    async countFindings(sessionUuid: string): Promise<number> {
        const {
            CorralAnimalObservationModel,
            CorralAnimalVisualConditionModel,
            CorralAnimalAdditionalMedicationModel,
            CorralAnimalAdditionalTreatmentModel,
        } = requireTenantModels();
        const [o, v, m, t] = await Promise.all([
            CorralAnimalObservationModel.count({ where: { uuid_corral_work_session: sessionUuid, is_active: true } }),
            CorralAnimalVisualConditionModel.count({ where: { uuid_corral_work_session: sessionUuid, is_active: true } }),
            CorralAnimalAdditionalMedicationModel.count({ where: { uuid_corral_work_session: sessionUuid, is_active: true } }),
            CorralAnimalAdditionalTreatmentModel.count({ where: { uuid_corral_work_session: sessionUuid, is_active: true } }),
        ]);
        return o + v + m + t;
    }
}

export default CorralSessionRepository;
