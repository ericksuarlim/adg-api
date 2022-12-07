const Pool = require("pg").Pool;
const database = require("../config/dbServer")

class SessionDBRepository {
    constructor(){
        this.cursor = null;
        this.pool = new Pool(database);
    }

    //Create Session
    async CreateSession(data) {
        const {
            user_name,
            user_token,
            active,
            login_date,
        } = data;
        const new_session = await this.pool.query(
        "INSERT INTO public.session(user_name, user_token, active, login_date) VALUES ($1, $2, $3, $4) RETURNING *",
        [
            user_name,
            user_token,
            active,
            login_date,
        ]
        );
        return new_session.rows[0];
    }

    //Obtener Lista de Sesiones
    async GetSessions() {
        const sessions = await this.pool.query("SELECT * FROM public.session");
        return sessions.rows[0];
    }


    //Logout
    async Logout(user_name){
        const updated_session = await this.pool.query(
            "UPDATE public.session SET active= false, user_token=null WHERE user_name=$1 RETURNING true",
            [
                user_name,
            ]
        );
        return updated_session.rows[0].bool;
    }

    //Delete expired session
    async DeleteExpiredSession(){
        const response = await this.pool.query("DELETE FROM public.session WHERE login_date<now()-interval'28 days'");
        return response
    }

    //Reset session
    async ResetSession(){
        const response = await this.pool.query("UPDATE public.session SET user_token=null, activa=false WHERE login_date<now()-interval'1 day'");
        return response
      }
}

module.exports = SessionDBRepository;
