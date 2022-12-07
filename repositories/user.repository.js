const Pool = require("pg").Pool;
const database = require("../config/dbServer")

class UserRepository {
    constructor(){
        this.cursor = null;
        this.pool = new Pool(database);
    }

    //Manage User
    async ManageUser(id_user){
        const user_updated = await this.pool.query(
        "UPDATE public.user SET enabled= NOT enabled WHERE uuid_user=$1 RETURNING *",
        [
            id_user,
        ]
        );
        return user_updated.rows[0]; 
    }
   
}

module.exports = UserRepository;
