const db = require('./localdatabase.config')
const Sequelize = require('sequelize')

const sequelize = new Sequelize(
  db.database,
  db.user,
  db.password, {
    host: db.host,
    logging: false,
    dialect: db.dialect,
    dialectOptions: {
    },
  }
)

module.exports = sequelize