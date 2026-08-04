import { requireTenantModels } from '../database/tenant/tenant-request-context';
import { CorralActivityCode } from '../constants/corral-work.constants';
import type { CorralActivityRecordAttributes } from '../interfaces/corral-session/corral-session.interface';

/**
 * Persists corral activity records into long-term animal history tables.
 */
class CorralSessionHistorySyncService {
    async syncActivityRecord(
        record: CorralActivityRecordAttributes,
        workDate: Date,
        ranchUuid: string
    ): Promise<void> {
        const { WeightRecordModel, AnimalIdentificationModel } = requireTenantModels();

        switch (record.activity_code) {
            case CorralActivityCode.WEIGHING: {
                if (record.numeric_value == null || record.weight_record_uuid) {
                    return;
                }
                const weightRow = await WeightRecordModel.create({
                    animal_uuid: record.animal_uuid,
                    weight: record.numeric_value,
                    weight_date: workDate,
                    description: `Corral session ${record.uuid_corral_work_session}`,
                });
                const weightUuid = weightRow.get('weight_record_uuid') as string;
                const { CorralActivityRecordModel } = requireTenantModels();
                await CorralActivityRecordModel.update(
                    { weight_record_uuid: weightUuid },
                    { where: { uuid_corral_activity_record: record.uuid_corral_activity_record } }
                );
                break;
            }
            case CorralActivityCode.IDENTIFICATION: {
                if (!record.text_value?.trim()) {
                    return;
                }
                await AnimalIdentificationModel.create({
                    animal_uuid: record.animal_uuid,
                    ranch_uuid: ranchUuid,
                    identification_type: (record.identification_type as 'ear_tag' | 'rfid') ?? 'ear_tag',
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

    async syncSessionOnClose(sessionUuid: string, ranchUuid: string, workDate: Date): Promise<void> {
        const { CorralActivityRecordModel } = requireTenantModels();
        const records = await CorralActivityRecordModel.findAll({
            where: { uuid_corral_work_session: sessionUuid, is_active: true },
        });
        for (const row of records) {
            const plain = row.get({ plain: true }) as CorralActivityRecordAttributes;
            await this.syncActivityRecord(plain, workDate, ranchUuid);
            if (plain.weight_record_uuid && plain.activity_code === CorralActivityCode.WEIGHING) {
                await row.update({ weight_record_uuid: plain.weight_record_uuid });
            }
        }
    }
}

export default CorralSessionHistorySyncService;
