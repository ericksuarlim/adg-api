import {Router} from "express";
import {container} from "../containers/container";
import { authorize } from "../middlewares/authorization.middleware";
import { Permission } from "../constants/authorization.constants";

const companyRoutes = Router();

companyRoutes.post('/', authorize(Permission.COMPANY_WRITE), container.companyController.createCompany);
companyRoutes.get('/', authorize(Permission.COMPANY_READ), container.companyController.getCompanies);
companyRoutes.get('/:uuid_company', authorize(Permission.COMPANY_READ), container.companyController.getCompany);
companyRoutes.put('/:uuid_company', authorize(Permission.COMPANY_WRITE), container.companyController.updateCompany);
companyRoutes.delete('/:uuid_company', authorize(Permission.COMPANY_WRITE), container.companyController.deleteCompany);

export default companyRoutes;
