"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tenant_request_context_1 = require("../database/tenant/tenant-request-context");
const corral_work_constants_1 = require("../constants/corral-work.constants");
/**
 * Persists corral activity records into long-term animal history tables.
 */
class CorralSessionHistorySyncService {
    async syncActivityRecord(record, workDate, ranchUuid) {
        const { WeightRecordModel, AnimalIdentificationModel } = (0, tenant_request_context_1.requireTenantModels)();
        switch (record.activity_code) {
            case corral_work_constants_1.CorralActivityCode.WEIGHING: {
                if (record.numeric_value == null || record.weight_record_uuid) {
                    return;
                }
                const weightRow = await WeightRecordModel.create({
                    animal_uuid: record.animal_uuid,
                    weight: record.numeric_value,
                    weight_date: workDate,
                    description: `Corral session ${record.uuid_corral_work_session}`,
                });
                const weightUuid = weightRow.get('weight_record_uuid');
                const { CorralActivityRecordModel } = (0, tenant_request_context_1.requireTenantModels)();
                await CorralActivityRecordModel.update({ weight_record_uuid: weightUuid }, { where: { uuid_corral_activity_record: record.uuid_corral_activity_record } });
                break;
            }
            case corral_work_constants_1.CorralActivityCode.IDENTIFICATION: {
                if (!record.text_value?.trim()) {
                    return;
                }
                await AnimalIdentificationModel.create({
                    animal_uuid: record.animal_uuid,
                    ranch_uuid: ranchUuid,
                    identification_type: record.identification_type ?? 'ear_tag',
                    identification_number: record.text_value.trim(),
                    assigned_date: workDate,
                    is_temporary: false,
                });
                break;
            }
            default:
                break;
        }
    }
    async syncSessionOnClose(sessionUuid, ranchUuid, workDate) {
        const { CorralActivityRecordModel } = (0, tenant_request_context_1.requireTenantModels)();
        const records = await CorralActivityRecordModel.findAll({
            where: { uuid_corral_work_session: sessionUuid, is_active: true },
        });
        for (const row of records) {
            const plain = row.get({ plain: true });
            await this.syncActivityRecord(plain, workDate, ranchUuid);
            if (plain.weight_record_uuid && plain.activity_code === corral_work_constants_1.CorralActivityCode.WEIGHING) {
                await row.update({ weight_record_uuid: plain.weight_record_uuid });
            }
        }
    }
}
exports.default = CorralSessionHistorySyncService;
