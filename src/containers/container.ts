import UserService from "../services/user.services";
import UserRepository from "../repositories/user.repository";
import CompanyRepository from "../repositories/company.repository";
import CompanyService from "../services/company.service";
import UserController from "../controllers/user.controller";
import CompanyController from "../controllers/company.controller";
import RanchRepository from "../repositories/ranch.repository";
import RanchService from "../services/ranch.service";
import AnimalRepository from "../repositories/animal.repository";
import AnimalService from "../services/animal.service";
import AnimalController from "../controllers/animal.controller";
import RanchController from "../controllers/ranch.controller";
import AnimalWorkSessionRepository from "../repositories/animal-work-session.repository";
import AnimalWorkSessionService from "../services/animal-work-session.service";
import AnimalWorkSessionController from "../controllers/animal-work-session.controller";
import AuthenticationRepository from "../repositories/authentication.repository";
import AuthenticationController from "../controllers/authentication.controller";
import AuthenticationService from "../services/authentication.service";
import SessionService from "../services/session.service";
import SessionRepository from "../repositories/session.repository";
import PasswordValidatorService from "../services/password/password-validator.service";
import MembershipRepository from "../repositories/membership.repository";
import MembershipService from "../services/membership.service";
import MembershipController from "../controllers/membership.controller";
import TenantProvisioningService from "../services/tenant-provisioning.service";
import ReferenceSampleRepository from "../repositories/reference-sample.repository";
import ReferenceSampleService from "../services/reference-sample.service";
import ReferenceSampleController from "../controllers/reference-sample.controller";
import CompanyPaymentRepository from "../repositories/company-payment.repository";
import CompanyPaymentService from "../services/company-payment.service";
import CompanyPaymentController from "../controllers/company-payment.controller";
import OwnerRepository from "../repositories/owner.repository";
import OwnerController from "../controllers/owner.controller";

//Repositories
const companyRepository = new CompanyRepository();
const userRepository = new UserRepository();
const ranchRepository = new RanchRepository();
const animalRepository = new AnimalRepository();
const animalWorkSessionRepository = new AnimalWorkSessionRepository();
const sessionRepository = new SessionRepository();
const authenticationRepository = new AuthenticationRepository();
const membershipRepository = new MembershipRepository();
const referenceSampleRepository = new ReferenceSampleRepository();
const companyPaymentRepository = new CompanyPaymentRepository();
const ownerRepository = new OwnerRepository();

//Services
const passwordValidatorService = new PasswordValidatorService();
const tenantProvisioningService = new TenantProvisioningService();
const companyService = new CompanyService(companyRepository, companyPaymentRepository, tenantProvisioningService);
const userService = new UserService(userRepository, userRepository, companyService, passwordValidatorService);
const ranchService = new RanchService(ranchRepository);
const animalService = new AnimalService(animalRepository, companyService);
const animalWorkSessionService = new AnimalWorkSessionService(animalWorkSessionRepository);
const sessionService = new SessionService(sessionRepository);
const authenticationService = new AuthenticationService(
    authenticationRepository,
    sessionService,
    userService,
    membershipRepository
);
const membershipService = new MembershipService(userService, ranchService);
const referenceSampleService = new ReferenceSampleService(referenceSampleRepository);
const companyPaymentService = new CompanyPaymentService(companyPaymentRepository, companyService);

//Controllers
const userController = new UserController(userService, userService);
const companyController = new CompanyController(companyService);
const animalController = new AnimalController(animalService);
const ranchController = new RanchController(ranchService);
const animalWorkSessionController = new AnimalWorkSessionController(animalWorkSessionService);
const authenticationController = new AuthenticationController(authenticationService);
const membershipController = new MembershipController(membershipService);
const referenceSampleController = new ReferenceSampleController(referenceSampleService);
const companyPaymentController = new CompanyPaymentController(companyPaymentService);
const ownerController = new OwnerController(ownerRepository);

export { membershipRepository };

export const container = {
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
}