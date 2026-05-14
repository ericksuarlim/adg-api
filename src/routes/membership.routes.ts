import {Router} from "express";
import {container} from "../containers/container";
import { authorize } from "../middlewares/authorization.middleware";
import { Permission } from "../constants/authorization.constants";

const membershipRoutes = Router();

membershipRoutes.post('/company-administrator', authorize(Permission.MEMBERSHIP_WRITE), container.membershipController.promoteCompanyAdministrator);
membershipRoutes.get('/ranch/:uuid_ranch', authorize(Permission.MEMBERSHIP_READ), container.membershipController.getUsersByRanch);
membershipRoutes.get('/user/:uuid_user', authorize(Permission.MEMBERSHIP_READ), container.membershipController.getRanchesByUser);
membershipRoutes.post('/', authorize(Permission.MEMBERSHIP_WRITE), container.membershipController.assign);
membershipRoutes.put('/:uuid_user', authorize(Permission.MEMBERSHIP_WRITE), container.membershipController.changeRole);
membershipRoutes.delete('/:uuid_user', authorize(Permission.MEMBERSHIP_WRITE), container.membershipController.remove);

export default membershipRoutes;
