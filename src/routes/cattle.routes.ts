import { Router } from 'express';
import {container} from "../containers/container";
import { authorize } from "../middlewares/authorization.middleware";
import { Permission } from "../constants/authorization.constants";

const cattleRoutes = Router();

cattleRoutes.post('/', authorize(Permission.CATTLE_WRITE), container.cattleController.createCattle);
cattleRoutes.get('/:uuid_cattle', authorize(Permission.CATTLE_READ), container.cattleController.getCattle);
cattleRoutes.get('/', authorize(Permission.CATTLE_READ), container.cattleController.getCattles);
cattleRoutes.put('/:uuid_cattle', authorize(Permission.CATTLE_WRITE), container.cattleController.updateCattle);
cattleRoutes.delete('/:uuid_cattle', authorize(Permission.CATTLE_WRITE), container.cattleController.deleteCattle);

export default cattleRoutes;
