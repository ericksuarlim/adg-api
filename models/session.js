const {Model, DataTypes} = require('sequelize')
const sequelize = require('../config/sequelize')

class Session extends Model {}
Session.init({
    uuid_session: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_name: {
        type: DataTypes.STRING
    },
    user_token: {
        type: DataTypes.STRING
    },
    active: {
        type: DataTypes.BOOLEAN
    },
    login_date: {
        type: DataTypes.DATE
    }
},{
    sequelize,
    freezeTableName: true,
    modelName: "session",
    timestamps: false,
});

module.exports = Session