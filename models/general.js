const {Model, DataTypes} = require('sequelize')
const sequelize = require('../config/sequelize')

class General extends Model {}
General.init({
    uuid_general: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    registry_number: {
        type: DataTypes.INTEGER
    },
    other_number: {
        type: DataTypes.INTEGER
    },
    sex: {
        type: DataTypes.STRING
    },
    color: {
        type: DataTypes.STRING
    },
    birthdate: {
        type: DataTypes.DATE
    },
    place: {
        type: DataTypes.STRING
    },
    observation:{
        type: DataTypes.STRING
    }
},{
    sequelize,
    freezeTableName: true,
    modelName: "general",
    timestamps: false,
});

module.exports = General