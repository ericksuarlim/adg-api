import {Router} from "express";
import {container} from "../containers/container";
import { authorize } from "../middlewares/authorization.middleware";
import { Permission } from "../constants/authorization.constants";
import companyPaymentRoutes from "./company-payment.routes";

const companyRoutes = Router();

companyRoutes.post('/', authorize(Permission.COMPANY_WRITE), container.companyController.createCompany);
companyRoutes.get('/', authorize(Permission.COMPANY_READ), container.companyController.getCompanies);
companyRoutes.get('/:uuid_company', authorize(Permission.COMPANY_TENANT_READ), container.companyController.getCompany);
companyRoutes.put('/:uuid_company', authorize(Permission.COMPANY_TENANT_WRITE), container.companyController.updateCompany);
companyRoutes.post('/:uuid_company/activate-trial', authorize(Permission.COMPANY_WRITE), container.companyController.activateTrial);
companyRoutes.post(
    '/:uuid_company/end-subscription',
    authorize(Permission.COMPANY_WRITE),
    container.companyController.endCompanySubscription
);
companyRoutes.post(
    '/:uuid_company/reactivate',
    authorize(Permission.COMPANY_WRITE),
    container.companyController.reactivateCompany
);
companyRoutes.delete('/:uuid_company', authorize(Permission.COMPANY_WRITE), container.companyController.deleteCompany);
companyRoutes.use('/:uuid_company/payments', companyPaymentRoutes);

export default companyRoutes;
