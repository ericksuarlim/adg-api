const Pool = require("pg").Pool;
const database = require("../config/dbServer")

class AttendanceRepository {
    constructor(){
        this.cursor = null;
        this.pool = new Pool(database);
    }
}

module.exports = AttendanceRepository;
