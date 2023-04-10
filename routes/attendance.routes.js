const _Attendance_Service = require ("../services/attendance.service");
const _Attendance = require ('../models/attendance');
const AttendanceService = new _Attendance_Service(_Attendance);
const { verifyAccessToken } = require ('../helpers/jwtHelper');


module.exports = function (app) {

    //Create Attendance
    app.post("/attendances", verifyAccessToken,async (req, res) => {
        try {
            const new_attendance = await AttendanceService.CreateAttendance(req);
            res.status(200).json(new_attendance);
        } catch (error) {
          res.status(error);
        }
    });

    //Get Attendance
    app.get("/attendances/:id_attendance", verifyAccessToken,async(req,res)=>{
        try{
            const attendance = await AttendanceService.GetAttendance(req);
            res.status(200).json(attendance);
        } catch(error){
            res.status(error);
        }
    });

    //Get Attendances
    app.get("/attendances", verifyAccessToken, async(req,res)=>{
        try{
            const attendances = await AttendanceService.GetAttendances();
            res.status(200).json(attendances);
        } catch(error){
            res.status(error);
        }
    });

    //Update Attendance
    app.put("/attendances/:id_attendance", verifyAccessToken, async (req,res) =>{
        try{
            const attendance_updated = await AttendanceService.UpdateAttendance(req);
            res.status(200).json(attendance_updated);
        } catch (error){
            res.status(error);
        }
    });

    //Delete Attendance
    app.delete("/attendances/:id_attendance", verifyAccessToken, async (req,res)=>{
        try {
            const is_deleted = await AttendanceService.DeleteAttendance(req);
            res.status(200).json(is_deleted);
        }catch (error){
            res.status(error);
        }
    });
}