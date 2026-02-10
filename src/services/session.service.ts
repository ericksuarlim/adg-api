const _Session_Repository = require("../repositories/session.repository");
const schedule = require('node-schedule');

class SessionService {
    constructor(Session){
        this.repository = new _Session_Repository();
        this.session = Session;
        this.deleteJ = schedule.scheduleJob('0 0 1 * *', this.DeleteExpiredSession.bind(this));
        this.resetJ = schedule.scheduleJob('0 0 * * *', this.ResetSession.bind(this));
    }

    //Eliminar Sesiones Antiguas
    async DeleteExpiredSession(){
        try {
            await this.repository.DeleteExpiredSession();
        } catch (error){
            console.error(error.message);
            return error;
        }
    }

    //Resetear sesiones
    async ResetSession(){
        try {
            await this.repository.ResetSession();
        } catch (error){
            console.error(error.message);
            return error;
        }
    }

    //Create Session
    async CreateSession(data) {
        try {
            //const session = await this.session.create(data)
            //return session;
            return await this.repository.CreateSession(data);
        } catch (error) {
            console.error(error.message);
            return error;
        }
    }

    //Logout
    async Logout(user_name){
        try{
            return await this.repository.Logout(user_name);
        }catch (error){
            console.error(error.message);
            return error;
        }
    } 

    //Get Sessions
    async GetSessions(){
        const sesiones = await this.repository.obtenerSesiones();
        return sesiones;
    }

}

module.exports = SessionService;