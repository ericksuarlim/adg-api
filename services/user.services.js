const _User_Repository = require("../repositories/user.repository");
const ApiError = require('../errors/apiError');
const httpStatusCodes = require('../errors/httpStatusCodes')

class ServicioUsuarios {
    constructor(User){
        this.repository = new _User_Repository();
        this.user = User;
    }
    
    //Get Users
    async GetUsers(){
        try {
            const users = await this.user.findAll();
            return users;        
        } catch (error) {
            console.error(error.message);
            return error;
        }
    }

    //Create User
    async CreateUser(data) {
        try {
            const user = await this.user.create(data.body)
            return user;          
        } catch (error) {
            console.error(error.message);
            return error;
        }
    }

    //Get User
    async GetUser(data){
        try{
            const user = await this.user.findByPk(data.params.id_user);
            return user;
        } catch (error){
            console.error(error.message);
            return error;
        }
    }

    //Delete User
    async DeleteUser(data){
        try{
            const user = await this.user.findByPk(data.params.id_user);
            return user!=null? await user.destroy().then(() => true).catch(() => false): false;
        }catch (error){
            console.error(error.message);
            return error;
        }
    }

    //Actualizar Usuario
    async UpdateUser(data){
        try{
            const user_updated = await this.user.update(data.body,{where: {uuid_user:data.params.id_user},returning: true,plain: true}).then(function (result) {
                return result[1];
            });
            return user_updated;
        }catch (error){
            console.error(error.message);
            return error;
        }
    }

    //Manage User
    async ManageUser(data){
        try{
            const response = await this.repository.ManageUser(data.params.id_user);
            return response;  
        }catch (error){
            console.error(error.message);
            return error;
        }
    }
    
}

module.exports = ServicioUsuarios;