const Pool = require("pg").Pool;
const { password } = require("../config/dbServer");
const database = require("../config/dbServer")


class AutenticationDBRepository {
    constructor(){
        this.cursor = null;
        this.pool = new Pool(database);
    }

  //Validate User
  async ValidateUser(user){
    const response = await this.pool.query(
      "SELECT EXISTS(SELECT 1 from public.user WHERE user_name = $1 and enabled=true)",[user]
    );
    return response.rows[0].exists;
  }

  //Validate Password
  async ValidatePassword(password, user_name){
    const response = await this.pool.query(
      "SELECT EXISTS(SELECT 1 from public.user WHERE password = $1 and user_name=$2)",[password,user_name]
    );
    return response.rows[0].exists;
  }

  //Validate Usuario Id
  async ValidateUserId(uuid_user){
    const response = await this.pool.query(
      "SELECT EXISTS(SELECT 1 from public.user WHERE uuid_user = $1 and enabled=true)",[uuid_user]
    );
    return response.rows[0].exists;
  }

  async ValidateCode(uuid_user, code){
    const response = await this.pool.query(
      "SELECT EXISTS(SELECT 1 from public.user WHERE uuid_user = $1 and password_code=$2)",[uuid_user,code]
    );
    return response.rows[0].exists;
  }

}

module.exports = AutenticationDBRepository;
