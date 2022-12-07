const _General_Service = require("../repositories/general.repository");
const ApiError = require('../errors/apiError');
const httpStatusCodes = require('../errors/httpStatusCodes')

class GeneralService {
    constructor(General){
        this.repository = new _General_Service();
        this.general = General;
    }
    
    //Get Generals
    async GetGenerals(){
        try {
            const generals = await this.general.findAll();
            return generals;        
        } catch (error) {
            console.error(error.message);
            return error;
        }
    }

    //Create General
    async CreateGeneral(data) {
        try {
            const general = await this.general.create(data.body)
            return general;          
        } catch (error) {
            console.error(error.message);
            return error;
        }
    }

    //Get General
    async GetGeneral(data){
        try{
            const general = await this.general.findByPk(data.params.uuid_general);
            return general;
        } catch (error){
            console.error(error.message);
            return error;
        }
    }

    //Delete General
    async DeleteGeneral(data){
        try{
            const general = await this.general.findByPk(data.params.uuid_general);
            return general!=null? await general.destroy().then(() => true).catch(() => false): false;
        }catch (error){
            console.error(error.message);
            return error;
        }
    }

    //Update General
    async UpdateGeneral(data){
        try{
            const general_updated = await this.general.update(data.body,{where: {uuid_general:data.params.uuid_general},returning: true,plain: true}).then(function (result) {
                return result[1];
            });
            return general_updated;
        }catch (error){
            console.error(error.message);
            return error;
        }
    }
    
}

module.exports = GeneralService;