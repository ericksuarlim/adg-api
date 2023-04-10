const {Model, DataTypes} = require('sequelize')
const sequelize = require('../config/sequelize')

class Attendance extends Model {}
Attendance.init({
    id_attendance: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    date: {
        type: DataTypes.DATE
    },
    condition: {
        type: DataTypes.STRING
    },
    observation: {
        type: DataTypes.STRING
    },
    id_health_service: {
        type: DataTypes.INTEGER
    }
},{
    sequelize,
    freezeTableName: true,
    modelName: "attendance",
    timestamps: false
});
module.exports = Attendance