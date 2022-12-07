const database = require("../config/dbServer")
const Sequelize = require('sequelize')

const sequelize = new Sequelize(
  database.database,
  database.user,
  database.password, {
    host: database.host,
    logging: false,
    dialect: database.dialect,
    dialectOptions: {
      ssl: {
        require: true, 
        rejectUnauthorized: false
      }
    },
  }
)

module.exports = sequelize