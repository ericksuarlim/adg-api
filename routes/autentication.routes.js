const _Autentication_Service = require ("../services/autentication.service");
const AutenticationService = new _Autentication_Service();
require('dotenv').config();


module.exports = function (app) {

    //Request new password
    app.post("/session/new-password", async (req, res) => {
      try {
        const response = await AutenticationService.RequestNewPassword(req.body);
        res.status(201).json(response);
      } catch (error) {
        res.status(404);
      }
    });

    //Reset password
    app.post("/session/reset-password", async (req, res) => {
      try {
        const response = await AutenticationService.ResetPassword(req.body);
        res.status(201).json(response);
      } catch (error) {
        res.status(404);
      }
    });

    //Login
    app.post("/session/login", async (req, res) => {
      try {
        const response = await AutenticationService.Login(req.body);
        res.status(201).json(response);
      } catch (error) {
        res.status(404);
      }
    });

    //Logout
    app.post("/session/logout", async (req, res) => {
      try {
        const response = await AutenticationService.Logout(req.body);
        res.status(201).json(response);
      } catch (error) {
        res.status(404);
      }
    });


}