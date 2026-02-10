import { Model } from 'sequelize';
import { ServiceResponse } from "../interfaces/common/service-response.interface";
import {
    AttendanceAttributes,
    AttendanceCreationAttributes
} from "../interfaces/attendance/attendance.general.interface";
import {
    ICreateService,
    IDeleteService,
    IGetAllService,
    IGetService,
    IUpdateService
} from "../interfaces/services/base-service.interface";

class AttendanceService implements
    IGetAllService<AttendanceAttributes>,
    IGetService<AttendanceAttributes>,
    ICreateService<AttendanceAttributes, AttendanceCreationAttributes>,
    IUpdateService<AttendanceAttributes, AttendanceCreationAttributes>,
    IDeleteService {

    private attendanceModel: typeof Model;

    constructor(GeneralModel: typeof Model) {
        this.attendanceModel = GeneralModel;
    }

    async getAll(
        params: { page: number; size: number; sortBy: string; order: 'ASC' | 'DESC' }
    ): Promise<ServiceResponse<AttendanceAttributes[]>> {
        const { page, size, sortBy, order } = params;

        const offset = (page - 1) * size;
        const limit = size;

        const result = await this.attendanceModel.findAndCountAll({
            offset,
            limit,
            order: [[sortBy, order]],
        });

        const totalPages = Math.ceil(result.count / size);

        const plainRows: AttendanceAttributes[] = result.rows.map((attendance: any) =>
            attendance.toJSON?.() ?? attendance
        );

        return {
            success: true,
            data: plainRows,
            pagination: {
                totalItems: result.count,
                totalPages,
                currentPage: page,
            },
        };
    }

    async create(
        attendanceBody: AttendanceCreationAttributes
    ): Promise<ServiceResponse<AttendanceAttributes>> {
        const attendance = await this.attendanceModel.create(attendanceBody);

        return { success: true, data: attendance };
    }

    async getById(
        id_attendance: string
    ): Promise<ServiceResponse<AttendanceAttributes | null>> {
        const attendance = await this.attendanceModel.findByPk(id_attendance);

        if (!attendance)
            return { success: false, error: 'Attendance not found', code: 404 };

        return { success: true, data: attendance };
    }

    async update(
        id_attendance: string,
        attendanceBody: AttendanceCreationAttributes
    ): Promise<ServiceResponse<AttendanceAttributes | null>> {
        const [count, updatedAttendance] = await this.attendanceModel.update(attendanceBody, {
            where: { id_attendance },
            returning: true,
            plain: true,
        });

        if (count === 0)
            return { success: false, error: 'Attendance not found', code: 404 };

        return { success: true, data: updatedAttendance };
    }

    async delete(
        id_attendance: string
    ): Promise<ServiceResponse<null>> {
        const attendance = await this.attendanceModel.findByPk(id_attendance);

        if (!attendance)
            return { success: false, error: 'Attendance not found', code: 404 };

        await attendance.destroy();

        return { success: true, data: null };
    }
}

export default AttendanceService;
