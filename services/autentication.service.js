const _Autentication_Repository = require("../repositories/autentication.repository");
const ApiError = require('../errors/apiError');
const _Session_Service = require ("./session.service");
const _Session = require ('../models/session');
const _User_Service = require ("./user.services");
const _User = require ('../models/user')
const UserService = new _User_Service(_User);
const SessionService = new _Session_Service(_Session);
const jwt = require('jsonwebtoken');
const httpStatusCodes = require('../errors/httpStatusCodes')


class ServicioAutenticacion {
    constructor(){
        this.repository = new _Autentication_Repository();
    }

    //Request New Password
    // async RequestNewPassword(data) {
    //     try {
    //         const user_exist = await this.repository.ValidateUser(data.user_name)
    //         if( user_exist===true){
    //             const code = Math.floor(Math.random() * 1000) + 1;
    //             const usuario = await UserService.setCodigo(data.user_name,code)
    //             const text_message =  `Usted solicito un cambio de contraseña, para realizarlo acceda al siguiente enlace: https://www.terminalmovima.com/sesion/restablecer-password?uuid_user=${usuario.uuid_user}&code=${usuario.codigo_password} tenga mucho cuidado en no compartir este mensaje y enlace con otra persona.`;
    //             const respuestaTM = client.messages
    //             .create({
    //                 body: text_message,
    //                 to: `+591${usuario.celular_referencia}`,
    //                 from: '+15617822519',
    //             }).then((message) => {
    //                 return message;
    //             }).catch(function(err){
    //                 console.error(err);
    //                 return err;
    //             });;
    //             return respuestaTM;
    //         }
    //         else
    //         {
    //             throw new ApiError(
    //                 'NOT FOUND',
    //                 httpStatusCodes.NOT_FOUND,
    //                 'Usuario incorrecto',
    //                 false
    //             );  
    //         }
    //     } catch (error) {
    //     console.error(error.message);
    //     return error;
    //     }
    // }

    //Entrar
    
    async Login(data) {
        try {

            const user_exist = await this.repository.ValidateUser(data.user_name)

            if(user_exist===true){

                const password = this.fromBinary(Buffer.from(data.password,'base64' ).toString());
                const password_exist = await this.repository.ValidatePassword(password,data.user_name);
                if(password_exist===true)
                {

                    const token = jwt.sign({
                        name: data.user_name
                    }, 'secreto',{expiresIn: '8h'})
                    const session = {
                        user_name: data.user_name,
                        user_token: token,
                        active: true,
                        login_date: new Date().toLocaleString("en-US", {timeZone: "America/La_Paz"})
                    }   
                    await SessionService.Logout(data.user_name); 
                    const created_session = await SessionService.CreateSession(session);    
                    const usuario = await UserService.GetUserByName(created_session.user_name);
                    return {error: null , sesion: created_session, usuario_registrado:usuario, isOperational: true};
                }
                else{
                    throw new ApiError(
                        'NOT FOUND',
                        httpStatusCodes.NOT_FOUND,
                        'Wrong password',
                        false
                    );
                }
            }
            else
            {
                throw new ApiError(
                    'NOT FOUND',
                    httpStatusCodes.NOT_FOUND,
                    'Wrong user',
                    false
                );
            }
        } catch (error) {
            console.error(error.message);
            return error;
        }
    }

    //Logout
    async Logout(data){
        try{
            const response = await SessionService.Logout(data.user_name); 
            return {response: response};   
        }catch (error) {
            console.error(error.message);
            return error;
        }
    }

    async ResetPassword(data){
        try {
            const user_exist = await this.repository.ValidateUserId(data.uuid_user)
            if( user_exist===true){
                const valid_code =await this.repository.ValidateCode(data.uuid_user,data.code)
                if(valid_code===true){
                    const new_user = await UserService.ResetPassword(data);
                    return {error: null , new_user: new_user, isOperational: true};
                }
                else
                {
                    throw new ApiError(
                        'BAD_REQUEST',
                        httpStatusCodes.NOT_FOUND,
                        'Code error, request a new code',
                        false
                    ); 
                }
            }
            else
            {
                throw new ApiError(
                    'NOT FOUND',
                    httpStatusCodes.NOT_FOUND,
                    'Wrong user',
                    false
                );  
            }
            
        } catch (error) {
            console.error(error.message);
            return error;
        }
    }

    fromBinary(binary) {
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < bytes.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        return String.fromCharCode(...new Uint16Array(bytes.buffer));
    }

}

module.exports = ServicioAutenticacion;