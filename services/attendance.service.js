const _Attendance_Repository = require("../repositories/attendance.repository");
const ApiError = require('../errors/apiError');
const httpStatusCodes = require('../errors/httpStatusCodes')

class AttendanceService {
    constructor(Attendance){
        this.repository = new _Attendance_Repository();
        this.attendance = Attendance;
    }
    
    //Get Attendances
    async GetAttendances(){
        try {
            const attendances = await this.attendance.findAll();
            return attendances;        
        } catch (error) {
            console.error(error.message);
            return error;
        }
    }

    //Create Attendance
    async CreateAttendance(data) {
        try {
            const new_attendances = [];
            for (const attendance of data.body)
            {
                const attendance_created = await this.attendance.create(attendance);
                new_attendances.push(attendance_created);
            }
            if( Object.keys(data.body).length === new_attendances.length)
            {
                return {attendances_created: new_attendances.length}
            } else {
                throw new ApiError(
                    'PARTIAL CONTENT',
                    httpStatusCodes.PARTIAL_CONTENT,
                    'There were problems creating certain records',
                    false
                );
            }      
        } catch (error) {
            console.error(error.message);
            return error;
        }
    }

    //Get Attendance
    async GetAttendance(data){
        try{
            const attendance = await this.attendance.findByPk(data.params.id_attendance);
            return attendance;
        } catch (error){
            console.error(error.message);
            return error;
        }
    }

    //Delete Attendance
    async DeleteAttendance(data){
        try{
            const attendance = await this.attendance.findByPk(data.params.id_attendance);
            return attendance!=null? await attendance.destroy().then(() => true).catch(() => false): false;
        }catch (error){
            console.error(error.message);
            return error;
        }
    }

    //Update Attendance
    async UpdateAttendance(data){
        try{
            const attendance_updated = await this.attendance.update(data.body,{where: {id_attendance:data.params.id_attendance},returning: true,plain: true}).then(function (result) {
                return result[1];
            });
            return attendance_updated;
        }catch (error){
            console.error(error.message);
            return error;
        }
    }    
}

module.exports = AttendanceService;