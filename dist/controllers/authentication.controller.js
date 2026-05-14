"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const response_handler_1 = require("../utils/response.handler");
class AuthenticationController {
    constructor(authenticationService) {
        this.requestNewPassword = async (req, res, next) => {
            try {
                const response = await this.authenticationService.requestNewPassword();
                return (0, response_handler_1.handleResponse)(res, response, 201);
            }
            catch (error) {
                next(error);
            }
        };
        this.resetPassword = async (req, res, next) => {
            try {
                const resetPasswordData = req.body;
                const response = await this.authenticationService.resetPassword(resetPasswordData);
                return (0, response_handler_1.handleResponse)(res, response, 201);
            }
            catch (error) {
                next(error);
            }
        };
        this.login = async (req, res, next) => {
            try {
                const { user_name, password } = req.body;
                const response = await this.authenticationService.login({ user_name, password });
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.logout = async (req, res, next) => {
            try {
                const logoutData = req.body;
                const response = await this.authenticationService.logout(logoutData, req.user?.username);
                return (0, response_handler_1.handleResponse)(res, response);
            }
            catch (error) {
                next(error);
            }
        };
        this.me = async (req, res, next) => {
            try {
                return (0, response_handler_1.handleResponse)(res, {
                    success: true,
                    data: {
                        username: req.user?.username,
                        uuid_company: req.user?.uuid_company,
                        roles: req.user?.roles,
                        membership_status: req.user?.membership_status,
                        membership_renewal_at: req.user?.membership_renewal_at
                    }
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.authenticationService = authenticationService;
    }
}
exports.default = AuthenticationController;
