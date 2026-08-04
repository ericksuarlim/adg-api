"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apiError_1 = __importDefault(require("../errors/apiError"));
const httpStatusCodes_1 = __importDefault(require("../errors/httpStatusCodes"));
const corral_work_constants_1 = require("../constants/corral-work.constants");
const ACTIVITY_COLUMN_LABELS = {
    [corral_work_constants_1.CorralActivityCode.ATTENDANCE]: 'Attendance',
    [corral_work_constants_1.CorralActivityCode.WEIGHING]: 'Weight',
    [corral_work_constants_1.CorralActivityCode.VACCINATION]: 'Vaccine',
    [corral_work_constants_1.CorralActivityCode.IDENTIFICATION]: 'Identification',
    [corral_work_constants_1.CorralActivityCode.DEWORMING]: 'Deworming',
    [corral_work_constants_1.CorralActivityCode.TREATMENT]: 'Treatment',
    [corral_work_constants_1.CorralActivityCode.INSPECTION]: 'Inspection',
};
const ACTIVITY_VALUE_TYPE = {
    [corral_work_constants_1.CorralActivityCode.ATTENDANCE]: 'boolean',
    [corral_work_constants_1.CorralActivityCode.WEIGHING]: 'number',
    [corral_work_constants_1.CorralActivityCode.VACCINATION]: 'medicine',
    [corral_work_constants_1.CorralActivityCode.IDENTIFICATION]: 'text',
    [corral_work_constants_1.CorralActivityCode.DEWORMING]: 'medicine',
    [corral_work_constants_1.CorralActivityCode.TREATMENT]: 'text',
    [corral_work_constants_1.CorralActivityCode.INSPECTION]: 'text',
};
class CorralWorkSessionService {
    constructor(repository, historySync) {
        this.repository = repository;
        this.historySync = historySync;
    }
    async getAll(params) {
        const { rows, count } = await this.repository.findAllSessions(params);
        const data = await Promise.all(rows.map(async (row) => this.toDetail(row.get({ plain: true }))));
        return {
            success: true,
            data,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / params.size),
                currentPage: params.page,
                order: params.order,
                pageSize: params.size,
            },
        };
    }
    async getById(uuid) {
        const session = await this.requireSession(uuid);
        return { success: true, data: await this.toDetail(session.get({ plain: true })) };
    }
    async getWorkspace(uuid) {
        const session = await this.requireSession(uuid);
        const plain = session.get({ plain: true });
        const stepsWithActivities = await this.repository.findStepsWithActivities(uuid);
        const animals = await this.repository.findSessionAnimals(uuid);
        const grids = [];
        for (const { step, activities } of stepsWithActivities) {
            const records = await this.repository.findActivityRecordsForStep(uuid, step.uuid_corral_session_step);
            const recordMap = new Map();
            for (const rec of records) {
                const colKey = rec.activity_code.toLowerCase();
                if (!recordMap.has(rec.animal_uuid)) {
                    recordMap.set(rec.animal_uuid, new Map());
                }
                const values = recordMap.get(rec.animal_uuid);
                values.set(colKey, this.recordToCellValue(rec));
            }
            grids.push({
                uuid_corral_session_step: step.uuid_corral_session_step,
                step_order: step.step_order,
                label: step.label,
                columns: activities.map((code) => this.buildColumn(code)),
                rows: animals.map((animal) => ({
                    animal_uuid: animal.animal_uuid,
                    registration_number: animal.registration_number,
                    chip_number: animal.chip_number,
                    values: Object.fromEntries(activities.map((code) => {
                        const key = code.toLowerCase();
                        const animalValues = recordMap.get(animal.animal_uuid);
                        return [key, animalValues?.get(key) ?? null];
                    })),
                })),
            });
        }
        return {
            success: true,
            data: {
                session: {
                    ...plain,
                    steps: stepsWithActivities.map(({ step, activities }) => ({
                        uuid_corral_session_step: step.uuid_corral_session_step,
                        step_order: step.step_order,
                        label: step.label,
                        activities,
                    })),
                    animal_count: animals.length,
                },
                grids,
                findings_summary_count: await this.repository.countFindings(uuid),
            },
        };
    }
    async create(body) {
        this.validateCreateBody(body);
        const created = await this.repository.createSession({
            ranch_uuid: body.ranch_uuid,
            work_date: new Date(body.work_date),
            status: corral_work_constants_1.CorralWorkSessionStatus.DRAFT,
            notes: body.notes ?? null,
            responsible_person: body.responsible_person ?? null,
            created_by: body.created_by ?? null,
            paddock_uuid: body.source_paddock_uuids?.[0] ?? null,
        });
        const sessionUuid = created.get('uuid_corral_work_session');
        await this.persistSources(sessionUuid, body);
        await this.persistStepsAndActivities(sessionUuid, body.activity_assignments);
        const animals = await this.repository.resolveAnimalsForSources(body.ranch_uuid, body.source_paddock_uuids ?? [], body.source_filters ?? [], body.manual_animal_uuids ?? []);
        if (animals.length === 0) {
            throw new apiError_1.default({
                name: 'ValidationError',
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: 'No animals matched the selected sources',
            });
        }
        await this.repository.bulkCreateSessionAnimals(animals.map((a) => ({
            uuid_corral_work_session: sessionUuid,
            animal_uuid: a.animal_uuid,
            registration_number: a.registration_number,
            chip_number: a.chip_number ?? null,
            is_expected: true,
        })));
        return {
            success: true,
            data: await this.toDetail(created.get({ plain: true })),
        };
    }
    async start(uuid) {
        const session = await this.requireSession(uuid);
        const status = session.get('status');
        if (status === corral_work_constants_1.CorralWorkSessionStatus.CLOSED) {
            throw new apiError_1.default({
                name: 'ValidationError',
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: 'Closed sessions cannot be started',
            });
        }
        if (status !== corral_work_constants_1.CorralWorkSessionStatus.IN_PROGRESS) {
            await this.repository.updateSession(uuid, {
                status: corral_work_constants_1.CorralWorkSessionStatus.IN_PROGRESS,
                started_at: new Date(),
            });
        }
        return this.getById(uuid);
    }
    async close(uuid) {
        const session = await this.requireSession(uuid);
        const plain = session.get({ plain: true });
        if (plain.status !== corral_work_constants_1.CorralWorkSessionStatus.CLOSED) {
            await this.historySync.syncSessionOnClose(uuid, plain.ranch_uuid, new Date(plain.work_date));
            await this.repository.updateSession(uuid, {
                status: corral_work_constants_1.CorralWorkSessionStatus.CLOSED,
                closed_at: new Date(),
            });
        }
        return this.getById(uuid);
    }
    async saveStepGrid(sessionUuid, stepUuid, body) {
        const session = await this.requireSession(sessionUuid);
        const plain = session.get({ plain: true });
        if (plain.status === corral_work_constants_1.CorralWorkSessionStatus.CLOSED) {
            throw new apiError_1.default({
                name: 'ValidationError',
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: 'Cannot modify a closed session',
            });
        }
        if (plain.status === corral_work_constants_1.CorralWorkSessionStatus.DRAFT) {
            await this.repository.updateSession(sessionUuid, {
                status: corral_work_constants_1.CorralWorkSessionStatus.IN_PROGRESS,
                started_at: new Date(),
            });
        }
        const stepsWithActivities = await this.repository.findStepsWithActivities(sessionUuid);
        const stepDef = stepsWithActivities.find((s) => s.step.uuid_corral_session_step === stepUuid);
        if (!stepDef) {
            throw new apiError_1.default({
                name: 'NotFound',
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
                description: 'Processing step not found',
            });
        }
        for (const row of body.rows) {
            for (const activity of stepDef.activities) {
                const colKey = activity.toLowerCase();
                const raw = row.values[colKey];
                if (raw === undefined || raw === null || raw === '') {
                    continue;
                }
                const payload = this.buildActivityPayload(sessionUuid, stepUuid, row.animal_uuid, activity, raw);
                await this.repository.upsertActivityRecord(payload);
                if (activity === corral_work_constants_1.CorralActivityCode.ATTENDANCE && payload.bool_value === true) {
                    await this.repository.updateSessionAnimalAttendance(sessionUuid, row.animal_uuid, true);
                }
            }
        }
        const workspace = await this.getWorkspace(sessionUuid);
        const grid = workspace.data?.grids.find((g) => g.uuid_corral_session_step === stepUuid);
        if (!grid) {
            throw new apiError_1.default({
                name: 'InternalError',
                statusCode: httpStatusCodes_1.default.INTERNAL_SERVER_ERROR,
                description: 'Failed to reload step grid',
            });
        }
        return { success: true, data: grid };
    }
    async lookupAnimal(sessionUuid, identifier) {
        const session = await this.requireSession(sessionUuid);
        const ranchUuid = session.get('ranch_uuid');
        const animal = await this.repository.findAnimalInRanchByIdentifier(ranchUuid, identifier);
        if (!animal) {
            throw new apiError_1.default({
                name: 'NotFound',
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
                description: 'Animal not found for this ranch',
            });
        }
        return {
            success: true,
            data: animal,
        };
    }
    async upsertFinding(sessionUuid, body) {
        await this.requireSession(sessionUuid);
        if (!body.animal_uuid?.trim()) {
            throw new apiError_1.default({
                name: 'ValidationError',
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: 'animal_uuid is required',
            });
        }
        if (body.observation_text?.trim()) {
            await this.repository.upsertObservation(sessionUuid, body.animal_uuid, body.uuid_corral_session_step, body.observation_text.trim());
        }
        if (body.condition_code) {
            if (!corral_work_constants_1.CORRAL_VISUAL_CONDITION_CODES.includes(body.condition_code)) {
                throw new apiError_1.default({
                    name: 'ValidationError',
                    statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                    description: 'Invalid visual condition code',
                });
            }
            await this.repository.upsertVisualCondition(sessionUuid, body.animal_uuid, body.uuid_corral_session_step, body.condition_code);
        }
        if (body.additional_medications) {
            await this.repository.replaceAdditionalMedications(sessionUuid, body.animal_uuid, body.uuid_corral_session_step, body.additional_medications);
        }
        if (body.additional_treatments) {
            await this.repository.replaceAdditionalTreatments(sessionUuid, body.animal_uuid, body.uuid_corral_session_step, body.additional_treatments);
        }
        return { success: true, data: null };
    }
    validateCreateBody(body) {
        if (!body.ranch_uuid?.trim()) {
            throw new apiError_1.default({ name: 'ValidationError', statusCode: httpStatusCodes_1.default.BAD_REQUEST, description: 'ranch_uuid is required' });
        }
        if (!body.work_date?.trim()) {
            throw new apiError_1.default({ name: 'ValidationError', statusCode: httpStatusCodes_1.default.BAD_REQUEST, description: 'work_date is required' });
        }
        const assignments = body.activity_assignments ?? [];
        if (assignments.length === 0) {
            throw new apiError_1.default({
                name: 'ValidationError',
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: 'At least one activity assignment is required',
            });
        }
        const hasSource = (body.source_paddock_uuids?.length ?? 0) > 0 ||
            (body.source_filters?.length ?? 0) > 0 ||
            (body.manual_animal_uuids?.length ?? 0) > 0;
        if (!hasSource) {
            throw new apiError_1.default({
                name: 'ValidationError',
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: 'At least one animal source is required (paddock, filter, or manual)',
            });
        }
        for (const item of assignments) {
            if (!corral_work_constants_1.CORRAL_ACTIVITY_CODES.includes(item.activity_code)) {
                throw new apiError_1.default({
                    name: 'ValidationError',
                    statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                    description: `Invalid activity: ${item.activity_code}`,
                });
            }
            if (!item.step_order || item.step_order < 1) {
                throw new apiError_1.default({
                    name: 'ValidationError',
                    statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                    description: 'step_order must be >= 1',
                });
            }
        }
    }
    async persistSources(sessionUuid, body) {
        for (const paddockUuid of body.source_paddock_uuids ?? []) {
            await this.repository.createSource({
                uuid_corral_work_session: sessionUuid,
                source_type: corral_work_constants_1.CorralSessionSourceType.PADDOCK,
                paddock_uuid: paddockUuid,
            });
        }
        for (const filter of body.source_filters ?? []) {
            await this.repository.createSource({
                uuid_corral_work_session: sessionUuid,
                source_type: corral_work_constants_1.CorralSessionSourceType.FILTER,
                filter_key: filter.filter_key,
                filter_value: filter.filter_value,
            });
        }
        for (const animalUuid of body.manual_animal_uuids ?? []) {
            await this.repository.createSource({
                uuid_corral_work_session: sessionUuid,
                source_type: corral_work_constants_1.CorralSessionSourceType.MANUAL,
                animal_uuid: animalUuid,
            });
        }
    }
    async persistStepsAndActivities(sessionUuid, assignments) {
        const stepOrders = [...new Set(assignments.map((a) => a.step_order))].sort((a, b) => a - b);
        const stepUuidByOrder = new Map();
        for (const order of stepOrders) {
            const step = await this.repository.createStep(sessionUuid, order);
            stepUuidByOrder.set(order, step.get('uuid_corral_session_step'));
        }
        for (const assignment of assignments) {
            const stepUuid = stepUuidByOrder.get(assignment.step_order);
            if (!stepUuid)
                continue;
            await this.repository.createStepActivity(stepUuid, assignment.activity_code);
        }
    }
    async toDetail(session) {
        const stepsWithActivities = await this.repository.findStepsWithActivities(session.uuid_corral_work_session);
        const sources = await this.repository.findSources(session.uuid_corral_work_session);
        const planned_activities = stepsWithActivities.flatMap((s) => s.activities);
        return {
            ...session,
            steps: stepsWithActivities.map(({ step, activities }) => ({
                uuid_corral_session_step: step.uuid_corral_session_step,
                step_order: step.step_order,
                label: step.label,
                activities,
            })),
            sources,
            planned_activities,
        };
    }
    async requireSession(uuid) {
        if (!uuid?.trim()) {
            throw new apiError_1.default({
                name: 'ValidationError',
                statusCode: httpStatusCodes_1.default.BAD_REQUEST,
                description: 'Corral work session id is required',
            });
        }
        const session = await this.repository.findSessionById(uuid);
        if (!session) {
            throw new apiError_1.default({
                name: 'NotFound',
                statusCode: httpStatusCodes_1.default.NOT_FOUND,
                description: 'Corral work session not found',
            });
        }
        return session;
    }
    buildColumn(code) {
        return {
            activity_code: code,
            column_key: code.toLowerCase(),
            label: ACTIVITY_COLUMN_LABELS[code],
            value_type: ACTIVITY_VALUE_TYPE[code],
        };
    }
    recordToCellValue(rec) {
        switch (rec.activity_code) {
            case corral_work_constants_1.CorralActivityCode.ATTENDANCE:
                return rec.bool_value ?? null;
            case corral_work_constants_1.CorralActivityCode.WEIGHING:
                return rec.numeric_value != null ? Number(rec.numeric_value) : null;
            default:
                return rec.text_value ?? rec.medicine_uuid ?? null;
        }
    }
    buildActivityPayload(sessionUuid, stepUuid, animalUuid, activity, raw) {
        const base = {
            uuid_corral_work_session: sessionUuid,
            uuid_corral_session_step: stepUuid,
            animal_uuid: animalUuid,
            activity_code: activity,
            bool_value: null,
            numeric_value: null,
            text_value: null,
            medicine_uuid: null,
            dose: null,
            unit: null,
            identification_type: null,
            weight_record_uuid: null,
        };
        switch (activity) {
            case corral_work_constants_1.CorralActivityCode.ATTENDANCE:
                base.bool_value = raw === true || raw === 'true' || raw === 1 || raw === '1';
                break;
            case corral_work_constants_1.CorralActivityCode.WEIGHING:
                base.numeric_value = typeof raw === 'number' ? raw : Number(raw);
                break;
            case corral_work_constants_1.CorralActivityCode.IDENTIFICATION:
                base.text_value = String(raw);
                base.identification_type = 'ear_tag';
                break;
            case corral_work_constants_1.CorralActivityCode.VACCINATION:
            case corral_work_constants_1.CorralActivityCode.DEWORMING:
                base.text_value = String(raw);
                break;
            default:
                base.text_value = String(raw);
        }
        return base;
    }
}
exports.default = CorralWorkSessionService;
