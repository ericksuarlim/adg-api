import { Router } from "express";
import { authorize } from "../middlewares/authorization.middleware";
import { Permission } from "../constants/authorization.constants";
import { container } from "../containers/container";

const companyPaymentRoutes = Router({ mergeParams: true });

companyPaymentRoutes.post(
    '/',
    authorize(Permission.COMPANY_WRITE),
    container.companyPaymentController.createCompanyPayment
);
companyPaymentRoutes.get(
    '/',
    authorize(Permission.COMPANY_READ),
    container.companyPaymentController.getCompanyPayments
);
companyPaymentRoutes.get(
    '/:uuid_company_payment',
    authorize(Permission.COMPANY_READ),
    container.companyPaymentController.getCompanyPayment
);
companyPaymentRoutes.put(
    '/:uuid_company_payment',
    authorize(Permission.COMPANY_WRITE),
    container.companyPaymentController.updateCompanyPayment
);
companyPaymentRoutes.delete(
    '/:uuid_company_payment',
    authorize(Permission.COMPANY_WRITE),
    container.companyPaymentController.deleteCompanyPayment
);

export default companyPaymentRoutes;
