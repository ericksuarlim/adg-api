const _User_Repository = require("../repositories/user.repository");
const ApiError = require('../errors/apiError');
const httpStatusCodes = require('../errors/httpStatusCodes')

class UserService {
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
            const user = await this.user.findByPk(data.params.uuid_user);
            return user;
        } catch (error){
            console.error(error.message);
            return error;
        }
    }

    //Delete User
    async DeleteUser(data){
        try{
            const user = await this.user.findByPk(data.params.uuid_user);
            return user!=null? await user.destroy().then(() => true).catch(() => false): false;
        }catch (error){
            console.error(error.message);
            return error;
        }
    }

    //Update User
    async UpdateUser(data){
        try{
            const user_updated = await this.user.update(data.body,{where: {uuid_user:data.params.uuid_user},returning: true,plain: true}).then(function (result) {
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
            const response = await this.repository.ManageUser(data.params.uuid_user);
            return response;  
        }catch (error){
            console.error(error.message);
            return error;
        }
    }

    
    //Get User by Name
    async GetUserByName(user_name){
        try{
            const user = await this.user.findOne({ where: { user_name: user_name } });
            return user;
        } catch (error){
            console.error(error.message);
            return error;
        }
    }
    
}

module.exports = UserService;