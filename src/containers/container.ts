import UserService from "../services/user.services";
import UserRepository from "../repositories/user.repository";
import CompanyRepository from "../repositories/company.repository";
import CompanyService from "../services/company.service";
import UserController from "../controllers/user.controller";
import CompanyController from "../controllers/company.controller";
import RanchRepository from "../repositories/ranch.repository";
import RanchService from "../services/ranch.service";
import CattleRepository from "../repositories/cattle.repository";
import CattleService from "../services/cattle.service";
import CattleController from "../controllers/cattle.controller";
import RanchController from "../controllers/ranch.controller";
import CattleWorkSessionRepository from "../repositories/cattle-work-session.repository";
import CattleWorkSessionService from "../services/cattle-work-session.service";
import CattleWorkSessionController from "../controllers/cattle-work-session.controller";
import AuthenticationRepository from "../repositories/authentication.repository";
import {Pool} from "pg";
import {databaseConfig} from "../config";
import AuthenticationController from "../controllers/authentication.controller";
import AuthenticationService from "../services/authentication.service";
import SessionService from "../services/session.service";
import SessionRepository from "../repositories/session.repository";
import PasswordValidatorService from "../services/password/password-validator.service";

//Config
const databasePool = new Pool(databaseConfig);

//Repositories
const companyRepository = new CompanyRepository();
const userRepository = new UserRepository();
const ranchRepository = new RanchRepository();
const cattleRepository = new CattleRepository();
const cattleWorkSessionRepository = new CattleWorkSessionRepository();
const sessionRepository = new SessionRepository();
const authenticationRepository = new AuthenticationRepository()

//Services
const passwordValidatorService = new PasswordValidatorService();
const companyService = new CompanyService(companyRepository);
const userService = new UserService(userRepository, userRepository, companyService, passwordValidatorService);
const ranchService = new RanchService(ranchRepository);
const cattleService = new CattleService(cattleRepository);
const cattleWorkSessionService = new CattleWorkSessionService(cattleWorkSessionRepository);
const sessionService = new SessionService(sessionRepository);
const authenticationService = new AuthenticationService(authenticationRepository, sessionService, userService, userService)

//Controllers
const userController = new UserController(userService, userService);
const companyController = new CompanyController(companyService);
const cattleController = new CattleController(cattleService);
const ranchController = new RanchController(ranchService);
const cattleWorkSessionController = new CattleWorkSessionController(cattleWorkSessionService);
const authenticationController = new AuthenticationController(authenticationService);

export const container = {
    userController,
    companyController,
    cattleController,
    ranchController,
    cattleWorkSessionController,
    authenticationController
}