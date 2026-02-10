import { ServiceResponse } from "../interfaces/common/service-response.interface";
import {
    ICreateService,
    IDeleteService,
    IGetAllService,
    IGetService,
    IUpdateService
} from "../interfaces/services/base-service.interface";
import {
    CattleWorkSessionAttributes,
    CattleWorkSessionCreationAttributes
} from "../interfaces/work-session/cattle-work-session.interface";
import {UserAttributes} from "../interfaces/user/user.interface";

class CattleWorkSessionService implements
    IGetAllService<CattleWorkSessionAttributes>,
    IGetService<CattleWorkSessionAttributes>,
    ICreateService<CattleWorkSessionAttributes, CattleWorkSessionCreationAttributes>,
    IUpdateService<CattleWorkSessionAttributes, CattleWorkSessionCreationAttributes>,
    IDeleteService {

    private cattleWorkSessionModel: any;

    constructor(CattleWorkSessionModel: any) {
        this.cattleWorkSessionModel = CattleWorkSessionModel;
    }

    async getAll(
        params: { page: number; size: number; sortBy: string; order: 'ASC' | 'DESC' }
    ): Promise<ServiceResponse<CattleWorkSessionAttributes[]>> {
        const { page, size, sortBy, order } = params;

        const offset = (page - 1) * size;
        const limit = size;

        const result = await this.cattleWorkSessionModel.findAndCountAll({
            offset,
            limit,
            order: [[sortBy, order]],
        });

        const totalPages = Math.ceil(result.count / size);

        const plainRows: CattleWorkSessionAttributes[] = result.rows.map((attendance: any) =>
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
        } as ServiceResponse<CattleWorkSessionAttributes[]>;
    }

    async create(
        attendanceBody: CattleWorkSessionCreationAttributes
    ): Promise<ServiceResponse<CattleWorkSessionAttributes>> {
        const attendance = await this.cattleWorkSessionModel.create(attendanceBody);

        return { success: true, data: attendance };
    }

    async getById(
        id_attendance: string
    ): Promise<ServiceResponse<CattleWorkSessionAttributes | null>> {
        const attendance = await this.cattleWorkSessionModel.findByPk(id_attendance);

        if (!attendance)
            return { success: false, error: 'Attendance not found', code: 404 };

        return { success: true, data: attendance };
    }

    async update(
        id_attendance: string,
        attendanceBody: CattleWorkSessionCreationAttributes
    ): Promise<ServiceResponse<CattleWorkSessionAttributes | null>> {
        const [count, updatedAttendance] = await this.cattleWorkSessionModel.update(attendanceBody, {
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
        const attendance = await this.cattleWorkSessionModel.findByPk(id_attendance);

        if (!attendance)
            return { success: false, error: 'Attendance not found', code: 404 };

        await attendance.destroy();

        return { success: true, data: null };
    }
}

export default CattleWorkSessionService;
