const _User_Service = require ("../services/user.services");
const _User = require ('../models/user');
const UserService = new _User_Service(_User);
// const {} = require ('../helpers/jwtHelper');


module.exports = function (app) {

    //Create User
    app.post("/users", async (req, res) => {
        try {
            const new_user = await UserService.CreateUser(req);
            res.status(200).json(new_user);
        } catch (error) {
          res.status(error);
        }
    });

    //Get user
    app.get("/users/:uuid-user",async(req,res)=>{
        try{
            const user = await UserService.GetUser(req);
            res.status(200).json(user);
        } catch(error){
            res.status(error);
        }
    });

    //Get users
    app.get("/users",async(req,res)=>{
        try{
            const users = await UserService.GetUsers();
            res.status(200).json(users);
        } catch(error){
            res.status(error);
        }
    });

    //Update User
    app.put("/users/:uuid-user", async (req,res) =>{
        try{
            const user_updated = await UserService.UpdateUser(req);
            res.status(200).json(user_updated);
        } catch (error){
            res.status(error);
        }
    });

    //ManageUser User
    app.put("/users/manage/:uuid_user", async (req,res) =>{
        try{
            const user_updated = await UserService.ManageUser(req);
            res.status(200).json(user_updated);
        } catch (error){
            res.status(error);
        }
    });

    //Delete User
    app.delete("/users/:uuid_user", async (req,res)=>{
        try {
            const is_deleted = await UserService.DeleteUser(req);
            res.status(200).json(is_deleted);
        }catch (error){
            res.status(error);
        }
    });
}