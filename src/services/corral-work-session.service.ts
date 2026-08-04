import { ServiceResponse } from '../interfaces/common/service-response.interface';
import ApiError from '../errors/apiError';
import HttpStatusCodes from '../errors/httpStatusCodes';
import CorralSessionRepository, { CorralWorkSessionListParams } from '../repositories/corral-session.repository';
import CorralSessionHistorySyncService from './corral-session-history-sync.service';
import {
    CorralActivityAssignmentInput,
    ConfigureCorralWorkBody,
    CorralSessionAnimalsLoadBody,
    CorralSessionAnimalsLoadResultDto,
    CorralSessionAnimalsPreviewDto,
    CorralSessionDetailDto,
    CorralSessionWorkspaceDto,
    CorralStepGridColumnDto,
    CorralStepGridDto,
    CorralWorkSessionAttributes,
    CreateCorralWorkSessionBody,
    SaveCorralStepGridBody,
    ScanCorralStepAnimalBody,
    UpsertCorralFindingBody,
    UpdateCorralStepWorkModeBody,
    AppendCorralStepAnimalsBody,
} from '../interfaces/corral-session/corral-session.interface';
import {
    CORRAL_ACTIVITY_CODES,
    CORRAL_ACTIVITY_COLUMN_LABELS,
    CORRAL_ACTIVITY_VALUE_TYPES,
    CORRAL_PRELOADED_WORK_MODES,
    CORRAL_STEP_WORK_MODES,
    CorralActivityCode,
    CorralSessionSourceType,
    CorralStepWorkMode,
    isMultiRecordActivity,
    CorralVisualConditionCode,
    CorralWorkSessionStatus,
    CORRAL_VISUAL_CONDITION_CODES,
} from '../constants/corral-work.constants';
import { AnimalAttributes } from '../interfaces/animal/animal.interface';
import { normalizeAnimalIdentifier } from '../utils/animal-identifier.util';

class CorralWorkSessionService {
    private readonly repository: CorralSessionRepository;
    private readonly historySync: CorralSessionHistorySyncService;

    constructor(repository: CorralSessionRepository, historySync: CorralSessionHistorySyncService) {
        this.repository = repository;
        this.historySync = historySync;
    }

    async getAll(params: CorralWorkSessionListParams): Promise<ServiceResponse<CorralSessionDetailDto[]>> {
        if (params.activity_code && !CORRAL_ACTIVITY_CODES.includes(params.activity_code)) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: `Invalid activity: ${params.activity_code}`,
            });
        }

        const { rows, count } = await this.repository.findAllSessions(params);
        const data = await Promise.all(
            rows.map(async (row) => this.toDetail(row.get({ plain: true }) as CorralWorkSessionAttributes))
        );
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

    async getById(uuid: string): Promise<ServiceResponse<CorralSessionDetailDto>> {
        const session = await this.requireSession(uuid);
        return { success: true, data: await this.toDetail(session.get({ plain: true }) as CorralWorkSessionAttributes) };
    }

    async getWorkspace(uuid: string): Promise<ServiceResponse<CorralSessionWorkspaceDto>> {
        const session = await this.requireSession(uuid);
        const plain = session.get({ plain: true }) as CorralWorkSessionAttributes;
        const stepsWithActivities = await this.repository.findStepsWithActivities(uuid);
        if (stepsWithActivities.length === 0) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Configure work steps before opening the workspace',
            });
        }

        const animals = await this.repository.findSessionAnimals(uuid);
        const grids: CorralStepGridDto[] = [];

        for (const { step, activities } of stepsWithActivities) {
            const stepAnimalUuids = await this.repository.findStepAnimalUuids(step.uuid_corral_session_step);
            const stepAnimals = animals.filter((animal) => stepAnimalUuids.has(animal.animal_uuid));

            const records = await this.repository.findActivityRecordsForStep(uuid, step.uuid_corral_session_step);
            const recordMap = new Map<string, Map<string, string | number | boolean | string[] | null>>();
            for (const rec of records) {
                const colKey = rec.activity_code.toLowerCase();
                if (!recordMap.has(rec.animal_uuid)) {
                    recordMap.set(rec.animal_uuid, new Map());
                }
                const values = recordMap.get(rec.animal_uuid)!;
                const cellValue = this.recordToCellValue(rec);
                if (isMultiRecordActivity(rec.activity_code)) {
                    const textValue = cellValue == null ? null : String(cellValue);
                    if (!textValue) continue;
                    const current = values.get(colKey);
                    if (Array.isArray(current)) {
                        current.push(textValue);
                    } else if (current != null && current !== '') {
                        values.set(colKey, [String(current), textValue]);
                    } else {
                        values.set(colKey, [textValue]);
                    }
                    continue;
                }
                values.set(colKey, cellValue);
            }

            grids.push({
                uuid_corral_session_step: step.uuid_corral_session_step,
                step_order: step.step_order,
                label: step.label,
                work_mode: step.work_mode,
                columns: activities.map((code) => this.buildColumn(code)),
                animal_count: stepAnimals.length,
                rows: stepAnimals.map((animal) => ({
                    animal_uuid: animal.animal_uuid,
                    registration_number: animal.registration_number,
                    chip_number: animal.chip_number,
                    values: Object.fromEntries(
                        activities.map((code) => {
                            const key = code.toLowerCase();
                            const animalValues = recordMap.get(animal.animal_uuid);
                            return [key, animalValues?.get(key) ?? null];
                        })
                    ),
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
                        work_mode: step.work_mode,
                        activities,
                    })),
                    animal_count: animals.length,
                },
                grids,
                findings_summary_count: await this.repository.countFindings(uuid),
            },
        };
    }

    async create(body: CreateCorralWorkSessionBody): Promise<ServiceResponse<CorralSessionDetailDto>> {
        this.validateCreateBody(body);

        const created = await this.repository.createSession({
            ranch_uuid: body.ranch_uuid,
            work_date: new Date(body.work_date),
            status: CorralWorkSessionStatus.DRAFT,
            notes: body.notes ?? null,
            responsible_person: body.responsible_person ?? null,
            created_by: body.created_by ?? null,
        });

        const sessionUuid = created.get('uuid_corral_work_session') as string;
        const assignments = body.activity_assignments ?? [];
        if (assignments.length > 0) {
            await this.persistStepsAndActivities(sessionUuid, assignments);
        }

        return {
            success: true,
            data: await this.toDetail(created.get({ plain: true }) as CorralWorkSessionAttributes),
        };
    }

    async configureWork(
        sessionUuid: string,
        body: ConfigureCorralWorkBody
    ): Promise<ServiceResponse<CorralSessionDetailDto>> {
        const session = await this.requireSession(sessionUuid);
        const plain = session.get({ plain: true }) as CorralWorkSessionAttributes;
        if (plain.status === CorralWorkSessionStatus.CLOSED) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Cannot configure a closed session',
            });
        }
        if (plain.status === CorralWorkSessionStatus.IN_PROGRESS) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Cannot reconfigure work while session is in progress',
            });
        }

        this.validateConfigureBody(body);
        await this.repository.deactivateStepAnimals(sessionUuid);
        await this.repository.deactivateStepsAndActivities(sessionUuid);
        await this.persistConfiguredSteps(sessionUuid, body.steps);

        return this.getById(sessionUuid);
    }

    async extendWorkConfiguration(
        sessionUuid: string,
        body: ConfigureCorralWorkBody
    ): Promise<ServiceResponse<CorralSessionDetailDto>> {
        const session = await this.requireSession(sessionUuid);
        const plain = session.get({ plain: true }) as CorralWorkSessionAttributes;
        if (plain.status === CorralWorkSessionStatus.CLOSED) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Cannot extend a closed session',
            });
        }

        this.validateConfigureBody(body);

        const currentSteps = await this.repository.findStepsWithActivities(sessionUuid);
        const currentByOrder = new Map(
            currentSteps.map((item) => [item.step.step_order, item])
        );
        const activityToStepOrder = new Map<CorralActivityCode, number>();
        for (const item of currentSteps) {
            for (const activityCode of item.activities) {
                activityToStepOrder.set(activityCode, item.step.step_order);
            }
        }

        const sortedSteps = [...body.steps].sort((a, b) => a.step_order - b.step_order);
        for (const stepPayload of sortedSteps) {
            const existing = currentByOrder.get(stepPayload.step_order);
            if (existing) {
                const existingActivities = new Set(existing.activities);
                for (const activityCode of stepPayload.activity_codes) {
                    if (existingActivities.has(activityCode)) {
                        continue;
                    }
                    if (activityToStepOrder.has(activityCode)) {
                        continue;
                    }
                    await this.repository.createStepActivity(
                        existing.step.uuid_corral_session_step,
                        activityCode
                    );
                    existing.activities.push(activityCode);
                    activityToStepOrder.set(activityCode, stepPayload.step_order);
                }
                continue;
            }

            const activitiesToAdd = stepPayload.activity_codes.filter(
                (activityCode) => !activityToStepOrder.has(activityCode)
            );
            if (activitiesToAdd.length === 0) {
                continue;
            }

            const created = await this.repository.createStep(
                sessionUuid,
                stepPayload.step_order,
                stepPayload.label ?? null,
                stepPayload.work_mode ?? CorralStepWorkMode.SCAN_DYNAMIC
            );
            const stepUuid = created.get('uuid_corral_session_step') as string;
            for (const activityCode of activitiesToAdd) {
                await this.repository.createStepActivity(stepUuid, activityCode);
                activityToStepOrder.set(activityCode, stepPayload.step_order);
            }
        }

        return this.getById(sessionUuid);
    }

    async scanStepAnimal(
        sessionUuid: string,
        stepUuid: string,
        body: ScanCorralStepAnimalBody
    ): Promise<ServiceResponse<CorralStepGridDto>> {
        const session = await this.requireSession(sessionUuid);
        const plain = session.get({ plain: true }) as CorralWorkSessionAttributes;
        if (plain.status === CorralWorkSessionStatus.CLOSED) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Cannot modify a closed session',
            });
        }

        const identifier = normalizeAnimalIdentifier(body.identifier ?? '');
        if (!identifier) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'identifier is required',
            });
        }

        const stepsWithActivities = await this.repository.findStepsWithActivities(sessionUuid);
        const stepDef = stepsWithActivities.find((item) => item.step.uuid_corral_session_step === stepUuid);
        if (!stepDef) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Processing step not found',
            });
        }

        const ranchUuid = plain.ranch_uuid;
        const animal = await this.requireAnimalInSessionRanch(ranchUuid, identifier);

        if (plain.status === CorralWorkSessionStatus.DRAFT) {
            await this.repository.updateSession(sessionUuid, {
                status: CorralWorkSessionStatus.IN_PROGRESS,
                started_at: new Date(),
            });
        }

        if (stepDef.step.work_mode === CorralStepWorkMode.SCAN_DYNAMIC) {
            await this.repository.ensureSessionAnimal(sessionUuid, animal, false);
            await this.repository.ensureStepAnimal(sessionUuid, stepUuid, animal.animal_uuid);
        } else {
            const stepAnimalUuids = await this.repository.findStepAnimalUuids(stepUuid);
            if (!stepAnimalUuids.has(animal.animal_uuid)) {
                throw new ApiError({
                    name: 'ValidationError',
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    description: 'Animal is not part of this step list',
                });
            }
        }

        const workspace = await this.getWorkspace(sessionUuid);
        const grid = workspace.data?.grids.find((item) => item.uuid_corral_session_step === stepUuid);
        if (!grid) {
            throw new ApiError({
                name: 'InternalError',
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
                description: 'Failed to reload step grid',
            });
        }
        return { success: true, data: grid };
    }

    async previewAnimals(
        sessionUuid: string,
        body: CorralSessionAnimalsLoadBody
    ): Promise<ServiceResponse<CorralSessionAnimalsPreviewDto>> {
        const session = await this.requireSession(sessionUuid);
        const ranchUuid = session.get('ranch_uuid') as string;
        this.validateAnimalsPreviewBody(body);

        const paddocks = body.source_paddock_uuids ?? [];
        const filters = body.source_filters ?? [];
        const manual = body.manual_animal_uuids ?? [];

        const { merged, fromPaddocks, fromFilters, fromManual } =
            await this.repository.resolveAnimalsBySourceBreakdown(ranchUuid, paddocks, filters, manual);

        return {
            success: true,
            data: {
                total_count: merged.length,
                animals: merged,
                breakdown: {
                    from_paddocks: fromPaddocks.size,
                    from_filters: fromFilters.size,
                    from_manual: fromManual.size,
                },
            },
        };
    }

    async loadAnimals(
        sessionUuid: string,
        body: CorralSessionAnimalsLoadBody
    ): Promise<ServiceResponse<CorralSessionAnimalsLoadResultDto>> {
        const session = await this.requireSession(sessionUuid);
        const plain = session.get({ plain: true }) as CorralWorkSessionAttributes;

        if (plain.status === CorralWorkSessionStatus.CLOSED) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Cannot load animals on a closed session',
            });
        }

        if (plain.status === CorralWorkSessionStatus.IN_PROGRESS) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Cannot replace animals while session is in progress',
            });
        }

        const stepsWithActivities = await this.repository.findStepsWithActivities(sessionUuid);
        const preloadedSteps = stepsWithActivities.filter((item) =>
            CORRAL_PRELOADED_WORK_MODES.includes(item.step.work_mode)
        );
        this.validateAnimalsLoadBody(body, preloadedSteps);

        const ranchUuid = plain.ranch_uuid;
        const paddocks = body.source_paddock_uuids ?? [];
        const filters = body.source_filters ?? [];
        const manual = body.manual_animal_uuids ?? [];

        const { merged } = await this.repository.resolveAnimalsBySourceBreakdown(
            ranchUuid,
            paddocks,
            filters,
            manual
        );

        if (merged.length === 0) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'No animals matched the selected sources',
            });
        }

        await this.repository.deactivateSessionSources(sessionUuid);
        await this.repository.deactivateSessionAnimals(sessionUuid);
        await this.repository.deactivateStepAnimals(sessionUuid);
        await this.persistSourcesFromLoadBody(sessionUuid, body);
        await this.repository.bulkCreateSessionAnimals(
            merged.map((a) => ({
                uuid_corral_work_session: sessionUuid,
                animal_uuid: a.animal_uuid,
                registration_number: a.registration_number,
                chip_number: a.chip_number ?? null,
                is_expected: true,
            }))
        );

        this.validateStepAssignments(
            new Set(merged.map((a) => a.animal_uuid)),
            stepsWithActivities,
            body.step_assignments
        );

        const preloadedStepUuids = new Set(
            stepsWithActivities
                .filter((item) => CORRAL_PRELOADED_WORK_MODES.includes(item.step.work_mode))
                .map((item) => item.step.uuid_corral_session_step)
        );
        const stepAnimalRows: Array<{
            uuid_corral_work_session: string;
            uuid_corral_session_step: string;
            animal_uuid: string;
        }> = [];
        for (const assignment of body.step_assignments ?? []) {
            if (!preloadedStepUuids.has(assignment.uuid_corral_session_step)) {
                continue;
            }
            const uniqueAnimalUuids = [...new Set(assignment.animal_uuids ?? [])];
            for (const animalUuid of uniqueAnimalUuids) {
                stepAnimalRows.push({
                    uuid_corral_work_session: sessionUuid,
                    uuid_corral_session_step: assignment.uuid_corral_session_step,
                    animal_uuid: animalUuid,
                });
            }
        }
        await this.repository.bulkCreateStepAnimals(stepAnimalRows);

        const sourcesSaved =
            paddocks.length + filters.length + manual.length;

        return {
            success: true,
            data: {
                total_count: merged.length,
                sources_saved: sourcesSaved,
            },
        };
    }

    async updateStepWorkMode(
        sessionUuid: string,
        stepUuid: string,
        body: UpdateCorralStepWorkModeBody
    ): Promise<ServiceResponse<CorralStepGridDto>> {
        const session = await this.requireSession(sessionUuid);
        const plain = session.get({ plain: true }) as CorralWorkSessionAttributes;
        if (plain.status === CorralWorkSessionStatus.CLOSED) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Cannot modify a closed session',
            });
        }

        if (!CORRAL_STEP_WORK_MODES.includes(body.work_mode)) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: `Invalid work mode: ${body.work_mode}`,
            });
        }

        const stepsWithActivities = await this.repository.findStepsWithActivities(sessionUuid);
        const stepDef = stepsWithActivities.find((item) => item.step.uuid_corral_session_step === stepUuid);
        if (!stepDef) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Processing step not found',
            });
        }

        await this.repository.updateStepWorkMode(stepUuid, body.work_mode);

        const workspace = await this.getWorkspace(sessionUuid);
        const grid = workspace.data?.grids.find((item) => item.uuid_corral_session_step === stepUuid);
        if (!grid) {
            throw new ApiError({
                name: 'InternalError',
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
                description: 'Failed to reload step grid',
            });
        }
        return { success: true, data: grid };
    }

    async appendAnimalsToStep(
        sessionUuid: string,
        stepUuid: string,
        body: AppendCorralStepAnimalsBody
    ): Promise<ServiceResponse<CorralStepGridDto>> {
        const session = await this.requireSession(sessionUuid);
        const plain = session.get({ plain: true }) as CorralWorkSessionAttributes;
        if (plain.status === CorralWorkSessionStatus.CLOSED) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Cannot modify a closed session',
            });
        }

        const stepsWithActivities = await this.repository.findStepsWithActivities(sessionUuid);
        const stepDef = stepsWithActivities.find((item) => item.step.uuid_corral_session_step === stepUuid);
        if (!stepDef) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Processing step not found',
            });
        }

        this.validateAnimalsPreviewBody(body);

        const ranchUuid = plain.ranch_uuid;
        const paddocks = body.source_paddock_uuids ?? [];
        const filters = body.source_filters ?? [];
        const manual = body.manual_animal_uuids ?? [];

        const { merged } = await this.repository.resolveAnimalsBySourceBreakdown(
            ranchUuid,
            paddocks,
            filters,
            manual
        );

        if (merged.length === 0) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'No animals matched the selected sources',
            });
        }

        if (plain.status === CorralWorkSessionStatus.DRAFT) {
            await this.repository.updateSession(sessionUuid, {
                status: CorralWorkSessionStatus.IN_PROGRESS,
                started_at: new Date(),
            });
        }

        await this.persistSourcesFromLoadBody(sessionUuid, body);

        const existingStepAnimalUuids = await this.repository.findStepAnimalUuids(stepUuid);
        let appendedCount = 0;
        for (const animal of merged) {
            if (existingStepAnimalUuids.has(animal.animal_uuid)) {
                continue;
            }
            await this.repository.ensureSessionAnimal(sessionUuid, animal, true);
            await this.repository.ensureStepAnimal(sessionUuid, stepUuid, animal.animal_uuid);
            appendedCount++;
        }

        if (appendedCount === 0) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'All matched animals are already in this step',
            });
        }

        const workspace = await this.getWorkspace(sessionUuid);
        const grid = workspace.data?.grids.find((item) => item.uuid_corral_session_step === stepUuid);
        if (!grid) {
            throw new ApiError({
                name: 'InternalError',
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
                description: 'Failed to reload step grid',
            });
        }
        return { success: true, data: grid };
    }

    async start(uuid: string): Promise<ServiceResponse<CorralSessionDetailDto>> {
        const session = await this.requireSession(uuid);
        const status = session.get('status') as CorralWorkSessionStatus;
        const stepsWithActivities = await this.repository.findStepsWithActivities(uuid);
        if (stepsWithActivities.length === 0) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Configure work steps before starting',
            });
        }

        if (status === CorralWorkSessionStatus.CLOSED) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Closed sessions cannot be started',
            });
        }
        if (status !== CorralWorkSessionStatus.IN_PROGRESS) {
            await this.repository.updateSession(uuid, {
                status: CorralWorkSessionStatus.IN_PROGRESS,
                started_at: new Date(),
            });
        }
        return this.getById(uuid);
    }

    async close(uuid: string): Promise<ServiceResponse<CorralSessionDetailDto>> {
        const session = await this.requireSession(uuid);
        const plain = session.get({ plain: true }) as CorralWorkSessionAttributes;
        if (plain.status !== CorralWorkSessionStatus.CLOSED) {
            await this.historySync.syncSessionOnClose(uuid, plain.ranch_uuid, new Date(plain.work_date));
            await this.repository.updateSession(uuid, {
                status: CorralWorkSessionStatus.CLOSED,
                closed_at: new Date(),
            });
        }
        return this.getById(uuid);
    }

    async saveStepGrid(
        sessionUuid: string,
        stepUuid: string,
        body: SaveCorralStepGridBody
    ): Promise<ServiceResponse<CorralStepGridDto>> {
        const session = await this.requireSession(sessionUuid);
        const plain = session.get({ plain: true }) as CorralWorkSessionAttributes;
        if (plain.status === CorralWorkSessionStatus.CLOSED) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Cannot modify a closed session',
            });
        }

        if (plain.status === CorralWorkSessionStatus.DRAFT) {
            await this.repository.updateSession(sessionUuid, {
                status: CorralWorkSessionStatus.IN_PROGRESS,
                started_at: new Date(),
            });
        }

        const stepsWithActivities = await this.repository.findStepsWithActivities(sessionUuid);
        const stepDef = stepsWithActivities.find((s) => s.step.uuid_corral_session_step === stepUuid);
        if (!stepDef) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Processing step not found',
            });
        }

        for (const row of body.rows) {
            for (const activity of stepDef.activities) {
                const colKey = activity.toLowerCase();
                const raw = row.values[colKey];

                if (isMultiRecordActivity(activity)) {
                    const rawItems = Array.isArray(raw) ? raw : raw == null || raw === '' ? [] : [raw];
                    const items = rawItems
                        .map((item) => (item == null ? '' : String(item).trim()))
                        .filter((item) => item.length > 0)
                        .map((text_value) => ({ text_value }));
                    await this.repository.replaceMultiActivityRecords(
                        sessionUuid,
                        stepUuid,
                        row.animal_uuid,
                        activity,
                        items
                    );
                    continue;
                }

                if (raw === undefined || raw === null || raw === '') {
                    continue;
                }
                if (Array.isArray(raw)) {
                    continue;
                }

                const payload = this.buildActivityPayload(
                    sessionUuid,
                    stepUuid,
                    row.animal_uuid,
                    activity,
                    raw
                );
                await this.repository.upsertActivityRecord(payload);

                if (activity === CorralActivityCode.ATTENDANCE && payload.bool_value === true) {
                    await this.repository.updateSessionAnimalAttendance(sessionUuid, row.animal_uuid, true);
                }
            }
        }

        const workspace = await this.getWorkspace(sessionUuid);
        const grid = workspace.data?.grids.find((g) => g.uuid_corral_session_step === stepUuid);
        if (!grid) {
            throw new ApiError({
                name: 'InternalError',
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
                description: 'Failed to reload step grid',
            });
        }
        return { success: true, data: grid };
    }

    async lookupAnimal(sessionUuid: string, identifier: string): Promise<ServiceResponse<AnimalAttributes>> {
        const session = await this.requireSession(sessionUuid);
        const ranchUuid = session.get('ranch_uuid') as string;
        const animal = await this.requireAnimalInSessionRanch(ranchUuid, identifier);
        return {
            success: true,
            data: animal as unknown as AnimalAttributes,
        };
    }

    async upsertFinding(sessionUuid: string, body: UpsertCorralFindingBody): Promise<ServiceResponse<null>> {
        await this.requireSession(sessionUuid);
        if (!body.animal_uuid?.trim()) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'animal_uuid is required',
            });
        }

        if (body.observation_text?.trim()) {
            await this.repository.upsertObservation(
                sessionUuid,
                body.animal_uuid,
                body.uuid_corral_session_step,
                body.observation_text.trim()
            );
        }

        if (body.condition_code) {
            if (!CORRAL_VISUAL_CONDITION_CODES.includes(body.condition_code as CorralVisualConditionCode)) {
                throw new ApiError({
                    name: 'ValidationError',
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    description: 'Invalid visual condition code',
                });
            }
            await this.repository.upsertVisualCondition(
                sessionUuid,
                body.animal_uuid,
                body.uuid_corral_session_step,
                body.condition_code
            );
        }

        if (body.additional_medications) {
            await this.repository.replaceAdditionalMedications(
                sessionUuid,
                body.animal_uuid,
                body.uuid_corral_session_step,
                body.additional_medications
            );
        }

        if (body.additional_treatments) {
            await this.repository.replaceAdditionalTreatments(
                sessionUuid,
                body.animal_uuid,
                body.uuid_corral_session_step,
                body.additional_treatments
            );
        }

        return { success: true, data: null };
    }

    private validateCreateBody(body: CreateCorralWorkSessionBody): void {
        if (!body.ranch_uuid?.trim()) {
            throw new ApiError({ name: 'ValidationError', statusCode: HttpStatusCodes.BAD_REQUEST, description: 'ranch_uuid is required' });
        }
        if (!body.work_date?.trim()) {
            throw new ApiError({ name: 'ValidationError', statusCode: HttpStatusCodes.BAD_REQUEST, description: 'work_date is required' });
        }
        const assignments = body.activity_assignments ?? [];
        for (const item of assignments) {
            if (!CORRAL_ACTIVITY_CODES.includes(item.activity_code)) {
                throw new ApiError({
                    name: 'ValidationError',
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    description: `Invalid activity: ${item.activity_code}`,
                });
            }
            if (!item.step_order || item.step_order < 1) {
                throw new ApiError({
                    name: 'ValidationError',
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    description: 'step_order must be >= 1',
                });
            }
        }
    }

    private validateConfigureBody(body: ConfigureCorralWorkBody): void {
        const steps = body.steps ?? [];
        if (steps.length === 0) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'At least one step is required',
            });
        }

        const stepOrders = new Set<number>();
        for (const step of steps) {
            if (!step.step_order || step.step_order < 1) {
                throw new ApiError({
                    name: 'ValidationError',
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    description: 'step_order must be >= 1',
                });
            }
            if (stepOrders.has(step.step_order)) {
                throw new ApiError({
                    name: 'ValidationError',
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    description: 'Duplicate step_order in configuration',
                });
            }
            stepOrders.add(step.step_order);

            if (!CORRAL_STEP_WORK_MODES.includes(step.work_mode ?? CorralStepWorkMode.SCAN_DYNAMIC)) {
                throw new ApiError({
                    name: 'ValidationError',
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    description: `Invalid work mode: ${step.work_mode}`,
                });
            }

            const activityCodes = step.activity_codes ?? [];
            if (activityCodes.length === 0) {
                throw new ApiError({
                    name: 'ValidationError',
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    description: 'Each step must include at least one activity',
                });
            }
            for (const code of activityCodes) {
                if (!CORRAL_ACTIVITY_CODES.includes(code)) {
                    throw new ApiError({
                        name: 'ValidationError',
                        statusCode: HttpStatusCodes.BAD_REQUEST,
                        description: `Invalid activity: ${code}`,
                    });
                }
            }
        }
    }

    private validateAnimalsPreviewBody(
        body: Pick<CorralSessionAnimalsLoadBody, 'source_paddock_uuids' | 'source_filters' | 'manual_animal_uuids'>
    ): void {
        const hasSource =
            (body.source_paddock_uuids?.length ?? 0) > 0 ||
            (body.source_filters?.length ?? 0) > 0 ||
            (body.manual_animal_uuids?.length ?? 0) > 0;
        if (!hasSource) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'At least one animal source is required (paddock, category filter, or manual)',
            });
        }
    }

    private validateAnimalsLoadBody(
        body: CorralSessionAnimalsLoadBody,
        preloadedSteps: Array<{ step: { uuid_corral_session_step: string } }>
    ): void {
        const hasSource =
            (body.source_paddock_uuids?.length ?? 0) > 0 ||
            (body.source_filters?.length ?? 0) > 0 ||
            (body.manual_animal_uuids?.length ?? 0) > 0;
        if (!hasSource) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'At least one animal source is required (paddock, category filter, or manual)',
            });
        }
        if (preloadedSteps.length > 0 && !body.step_assignments?.length) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Step animal assignments are required for preloaded steps',
            });
        }
    }

    private validateStepAssignments(
        loadedAnimalUuids: Set<string>,
        stepsWithActivities: Array<{ step: { uuid_corral_session_step: string; work_mode: CorralStepWorkMode } }>,
        assignments: CorralSessionAnimalsLoadBody['step_assignments']
    ): void {
        const preloadedSteps = stepsWithActivities.filter((item) =>
            CORRAL_PRELOADED_WORK_MODES.includes(item.step.work_mode)
        );
        if (preloadedSteps.length === 0) {
            return;
        }

        const validStepUuids = new Set(preloadedSteps.map((item) => item.step.uuid_corral_session_step));
        const animalsAssignedToPreloadedStep = new Set<string>();

        for (const assignment of assignments ?? []) {
            if (!validStepUuids.has(assignment.uuid_corral_session_step)) {
                continue;
            }
            for (const animalUuid of assignment.animal_uuids ?? []) {
                if (!loadedAnimalUuids.has(animalUuid)) {
                    throw new ApiError({
                        name: 'ValidationError',
                        statusCode: HttpStatusCodes.BAD_REQUEST,
                        description: 'Assigned animal is not part of the loaded set',
                    });
                }
                animalsAssignedToPreloadedStep.add(animalUuid);
            }
        }

        for (const animalUuid of loadedAnimalUuids) {
            if (!animalsAssignedToPreloadedStep.has(animalUuid)) {
                throw new ApiError({
                    name: 'ValidationError',
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    description: 'Every loaded animal must be assigned to at least one preloaded step',
                });
            }
        }
    }

    private async persistSourcesFromLoadBody(
        sessionUuid: string,
        body: Pick<CorralSessionAnimalsLoadBody, 'source_paddock_uuids' | 'source_filters' | 'manual_animal_uuids'>
    ): Promise<void> {
        for (const paddockUuid of body.source_paddock_uuids ?? []) {
            await this.repository.createSource({
                uuid_corral_work_session: sessionUuid,
                source_type: CorralSessionSourceType.PADDOCK,
                paddock_uuid: paddockUuid,
            });
        }
        for (const filter of body.source_filters ?? []) {
            await this.repository.createSource({
                uuid_corral_work_session: sessionUuid,
                source_type: CorralSessionSourceType.FILTER,
                filter_key: filter.filter_key,
                filter_value: filter.filter_value,
            });
        }
        for (const animalUuid of body.manual_animal_uuids ?? []) {
            await this.repository.createSource({
                uuid_corral_work_session: sessionUuid,
                source_type: CorralSessionSourceType.MANUAL,
                animal_uuid: animalUuid,
            });
        }
    }

    private async persistConfiguredSteps(
        sessionUuid: string,
        steps: ConfigureCorralWorkBody['steps']
    ): Promise<void> {
        const sorted = [...steps].sort((a, b) => a.step_order - b.step_order);
        for (const step of sorted) {
            const created = await this.repository.createStep(
                sessionUuid,
                step.step_order,
                step.label ?? null,
                step.work_mode ?? CorralStepWorkMode.SCAN_DYNAMIC
            );
            const stepUuid = created.get('uuid_corral_session_step') as string;
            for (const activityCode of step.activity_codes) {
                await this.repository.createStepActivity(stepUuid, activityCode);
            }
        }
    }

    private async persistStepsAndActivities(
        sessionUuid: string,
        assignments: CorralActivityAssignmentInput[]
    ): Promise<void> {
        const stepOrders = [...new Set(assignments.map((a) => a.step_order))].sort((a, b) => a - b);
        const stepUuidByOrder = new Map<number, string>();

        for (const order of stepOrders) {
            const step = await this.repository.createStep(sessionUuid, order);
            stepUuidByOrder.set(order, step.get('uuid_corral_session_step') as string);
        }

        for (const assignment of assignments) {
            const stepUuid = stepUuidByOrder.get(assignment.step_order);
            if (!stepUuid) continue;
            await this.repository.createStepActivity(stepUuid, assignment.activity_code);
        }
    }

    private async toDetail(session: CorralWorkSessionAttributes): Promise<CorralSessionDetailDto> {
        const stepsWithActivities = await this.repository.findStepsWithActivities(session.uuid_corral_work_session);
        const sources = await this.repository.findSources(session.uuid_corral_work_session);
        const planned_activities = stepsWithActivities.flatMap((s) => s.activities);
        const animalCount = await this.repository.countSessionAnimals(session.uuid_corral_work_session);
        return {
            ...session,
            steps: stepsWithActivities.map(({ step, activities }) => ({
                uuid_corral_session_step: step.uuid_corral_session_step,
                step_order: step.step_order,
                label: step.label,
                work_mode: step.work_mode,
                activities,
            })),
            sources,
            planned_activities,
            animal_count: animalCount,
            animals_loaded: true,
            work_configured: stepsWithActivities.length > 0,
            requires_animal_load: false,
        };
    }

    private async requireAnimalInSessionRanch(
        ranchUuid: string,
        identifier: string
    ): Promise<{ animal_uuid: string; registration_number: string; chip_number?: string | null }> {
        const animal = await this.repository.findAnimalInRanchByIdentifier(ranchUuid, identifier);
        if (animal) {
            return animal;
        }

        const fallback = await this.repository.findActiveAnimalByIdentifier(identifier);
        if (fallback && fallback.ranch_uuid !== ranchUuid) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Animal not found for this ranch',
            });
        }

        throw new ApiError({
            name: 'NotFound',
            statusCode: HttpStatusCodes.NOT_FOUND,
            description: 'Animal not found for this ranch',
        });
    }

    private async requireSession(uuid: string) {
        if (!uuid?.trim()) {
            throw new ApiError({
                name: 'ValidationError',
                statusCode: HttpStatusCodes.BAD_REQUEST,
                description: 'Corral work session id is required',
            });
        }
        const session = await this.repository.findSessionById(uuid);
        if (!session) {
            throw new ApiError({
                name: 'NotFound',
                statusCode: HttpStatusCodes.NOT_FOUND,
                description: 'Corral work session not found',
            });
        }
        return session;
    }

    private buildColumn(code: CorralActivityCode): CorralStepGridColumnDto {
        return {
            activity_code: code,
            column_key: code.toLowerCase(),
            label: CORRAL_ACTIVITY_COLUMN_LABELS[code],
            value_type: CORRAL_ACTIVITY_VALUE_TYPES[code],
        };
    }

    private recordToCellValue(rec: {
        activity_code: string;
        bool_value?: boolean | null;
        numeric_value?: number | null;
        text_value?: string | null;
        medicine_uuid?: string | null;
    }): string | number | boolean | null {
        switch (rec.activity_code) {
            case CorralActivityCode.ATTENDANCE:
                return rec.bool_value ?? null;
            case CorralActivityCode.WEIGHING:
                return rec.numeric_value != null ? Number(rec.numeric_value) : null;
            default:
                return rec.text_value ?? rec.medicine_uuid ?? null;
        }
    }

    private buildActivityPayload(
        sessionUuid: string,
        stepUuid: string,
        animalUuid: string,
        activity: CorralActivityCode,
        raw: string | number | boolean
    ) {
        const base = {
            uuid_corral_work_session: sessionUuid,
            uuid_corral_session_step: stepUuid,
            animal_uuid: animalUuid,
            activity_code: activity,
            bool_value: null as boolean | null,
            numeric_value: null as number | null,
            text_value: null as string | null,
            medicine_uuid: null as string | null,
            dose: null as string | null,
            unit: null as string | null,
            identification_type: null as string | null,
            weight_record_uuid: null as string | null,
        };

        switch (activity) {
            case CorralActivityCode.ATTENDANCE:
                base.bool_value = raw === true || raw === 'true' || raw === 1 || raw === '1';
                break;
            case CorralActivityCode.WEIGHING:
                base.numeric_value = typeof raw === 'number' ? raw : Number(raw);
                break;
            case CorralActivityCode.IDENTIFICATION:
                base.text_value = String(raw);
                base.identification_type = 'ear_tag';
                break;
            case CorralActivityCode.VACCINATION:
            case CorralActivityCode.DEWORMING:
                base.text_value = String(raw);
                break;
            default:
                base.text_value = String(raw);
        }
        return base;
    }
}

export default CorralWorkSessionService;
