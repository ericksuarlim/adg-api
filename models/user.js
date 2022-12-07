const {Model, DataTypes} = require('sequelize')
const sequelize = require('../config/sequelize')

class User extends Model {}
User.init({
    uuid_user: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_card: {
        type: DataTypes.INTEGER
    },
    names: {
        type: DataTypes.STRING
    },
    last_name: {
        type: DataTypes.STRING
    },
    mother_last_name: {
        type: DataTypes.STRING
    },
    cell_phone: {
        type: DataTypes.INTEGER
    },
    email: {
        type: DataTypes.STRING
    },
    user_name: {
        type: DataTypes.STRING
    },
    password: {
        type: DataTypes.STRING
    },
    role: {
        type: DataTypes.STRING
    },
    enabled: {
        type: DataTypes.BOOLEAN
    },
    password_code: {
        type: DataTypes.STRING
    },
},{
    sequelize,
    freezeTableName: true,
    modelName: "user",
    timestamps: false
});
module.exports = User