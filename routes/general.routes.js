const _General_Service = require ("../services/general.service");
const _General = require ('../models/general');
const GeneralService = new _General_Service(_General);


module.exports = function (app) {

    //Create General
    app.post("/general", async (req, res) => {
        try {
            const new_general = await GeneralService.CreateGeneral(req);
            res.status(200).json(new_general);
        } catch (error) {
          res.status(error);
        }
    });

    //Get General
    app.get("/general/:uuid_general",async(req,res)=>{
        try{
            const general = await GeneralService.GetGeneral(req);
            res.status(200).json(general);
        } catch(error){
            res.status(error);
        }
    });

    //Get General
    app.get("/general",async(req,res)=>{
        try{
            const general = await GeneralService.GetGenerals();
            res.status(200).json(general);
        } catch(error){
            res.status(error);
        }
    });

    //Update General
    app.put("/general/:uuid_general", async (req,res) =>{
        try{
            const general_updated = await GeneralService.UpdateGeneral(req);
            res.status(200).json(general_updated);
        } catch (error){
            res.status(error);
        }
    });

    //Delete General
    app.delete("/general/:uuid_general", async (req,res)=>{
        try {
            const is_deleted = await GeneralService.DeleteGeneral(req);
            res.status(200).json(is_deleted);
        }catch (error){
            res.status(error);
        }
    });
}