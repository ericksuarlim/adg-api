"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = exports.membershipRepository = void 0;
const user_services_1 = __importDefault(require("../services/user.services"));
const user_repository_1 = __importDefault(require("../repositories/user.repository"));
const company_repository_1 = __importDefault(require("../repositories/company.repository"));
const company_service_1 = __importDefault(require("../services/company.service"));
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const company_controller_1 = __importDefault(require("../controllers/company.controller"));
const ranch_repository_1 = __importDefault(require("../repositories/ranch.repository"));
const ranch_service_1 = __importDefault(require("../services/ranch.service"));
const animal_repository_1 = __importDefault(require("../repositories/animal.repository"));
const animal_service_1 = __importDefault(require("../services/animal.service"));
const animal_controller_1 = __importDefault(require("../controllers/animal.controller"));
const ranch_controller_1 = __importDefault(require("../controllers/ranch.controller"));
const animal_work_session_repository_1 = __importDefault(require("../repositories/animal-work-session.repository"));
const animal_work_session_service_1 = __importDefault(require("../services/animal-work-session.service"));
const animal_work_session_controller_1 = __importDefault(require("../controllers/animal-work-session.controller"));
const authentication_repository_1 = __importDefault(require("../repositories/authentication.repository"));
const authentication_controller_1 = __importDefault(require("../controllers/authentication.controller"));
const authentication_service_1 = __importDefault(require("../services/authentication.service"));
const session_service_1 = __importDefault(require("../services/session.service"));
const session_repository_1 = __importDefault(require("../repositories/session.repository"));
const password_validator_service_1 = __importDefault(require("../services/password/password-validator.service"));
const membership_repository_1 = __importDefault(require("../repositories/membership.repository"));
const membership_service_1 = __importDefault(require("../services/membership.service"));
const membership_controller_1 = __importDefault(require("../controllers/membership.controller"));
const tenant_provisioning_service_1 = __importDefault(require("../services/tenant-provisioning.service"));
const reference_sample_repository_1 = __importDefault(require("../repositories/reference-sample.repository"));
const reference_sample_service_1 = __importDefault(require("../services/reference-sample.service"));
const reference_sample_controller_1 = __importDefault(require("../controllers/reference-sample.controller"));
const company_payment_repository_1 = __importDefault(require("../repositories/company-payment.repository"));
const company_payment_service_1 = __importDefault(require("../services/company-payment.service"));
const company_payment_controller_1 = __importDefault(require("../controllers/company-payment.controller"));
const owner_repository_1 = __importDefault(require("../repositories/owner.repository"));
const owner_controller_1 = __importDefault(require("../controllers/owner.controller"));
//Repositories
const companyRepository = new company_repository_1.default();
const userRepository = new user_repository_1.default();
const ranchRepository = new ranch_repository_1.default();
const animalRepository = new animal_repository_1.default();
const animalWorkSessionRepository = new animal_work_session_repository_1.default();
const sessionRepository = new session_repository_1.default();
const authenticationRepository = new authentication_repository_1.default();
const membershipRepository = new membership_repository_1.default();
exports.membershipRepository = membershipRepository;
const referenceSampleRepository = new reference_sample_repository_1.default();
const companyPaymentRepository = new company_payment_repository_1.default();
const ownerRepository = new owner_repository_1.default();
//Services
const passwordValidatorService = new password_validator_service_1.default();
const tenantProvisioningService = new tenant_provisioning_service_1.default();
const companyService = new company_service_1.default(companyRepository, companyPaymentRepository, tenantProvisioningService);
const userService = new user_services_1.default(userRepository, userRepository, companyService, passwordValidatorService);
const ranchService = new ranch_service_1.default(ranchRepository);
const animalService = new animal_service_1.default(animalRepository, companyService);
const animalWorkSessionService = new animal_work_session_service_1.default(animalWorkSessionRepository);
const sessionService = new session_service_1.default(sessionRepository);
const authenticationService = new authentication_service_1.default(authenticationRepository, sessionService, userService, membershipRepository);
const membershipService = new membership_service_1.default(userService, ranchService);
const referenceSampleService = new reference_sample_service_1.default(referenceSampleRepository);
const companyPaymentService = new company_payment_service_1.default(companyPaymentRepository, companyService);
//Controllers
const userController = new user_controller_1.default(userService, userService);
const companyController = new company_controller_1.default(companyService);
const animalController = new animal_controller_1.default(animalService);
const ranchController = new ranch_controller_1.default(ranchService);
const animalWorkSessionController = new animal_work_session_controller_1.default(animalWorkSessionService);
const authenticationController = new authentication_controller_1.default(authenticationService);
const membershipController = new membership_controller_1.default(membershipService);
const referenceSampleController = new reference_sample_controller_1.default(referenceSampleService);
const companyPaymentController = new company_payment_controller_1.default(companyPaymentService);
const ownerController = new owner_controller_1.default(ownerRepository);
exports.container = {
    userController,
    companyController,
    animalController,
    ranchController,
    animalWorkSessionController,
    authenticationController,
    membershipController,
    referenceSampleController,
    companyPaymentController,
    ownerController
};
