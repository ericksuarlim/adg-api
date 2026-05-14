import {Router} from "express";
import {container} from "../containers/container";
import { authorize } from "../middlewares/authorization.middleware";
import { Permission } from "../constants/authorization.constants";

const ranchRoutes = Router();

ranchRoutes.post('/', authorize(Permission.RANCH_WRITE), container.ranchController.createRanch);
ranchRoutes.get('/', authorize(Permission.RANCH_READ), container.ranchController.getRanches);
ranchRoutes.get('/:uuid_ranch/paddocks', authorize(Permission.RANCH_READ), container.ranchController.getRanchPaddocks);
ranchRoutes.get('/:uuid_ranch', authorize(Permission.RANCH_READ), container.ranchController.getRanch);
ranchRoutes.put('/:uuid_ranch', authorize(Permission.RANCH_WRITE), container.ranchController.updateRanch);
ranchRoutes.delete('/:uuid_ranch', authorize(Permission.RANCH_WRITE), container.ranchController.deleteRanch);

export default ranchRoutes;