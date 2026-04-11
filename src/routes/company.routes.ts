import {Router} from "express";
import {container} from "../containers/container";

const companyRoutes = Router();

companyRoutes.post('/', container.companyController.createCompany);
companyRoutes.get('/', container.companyController.getCompanies);
companyRoutes.get('/:uuid_company', container.companyController.getCompany);
companyRoutes.put('/:uuid_company', container.companyController.updateCompany);
companyRoutes.delete('/:uuid_company', container.companyController.deleteCompany);

export default companyRoutes;
