import { Router } from 'express';
import {container} from "../containers/container";
import { authorize } from "../middlewares/authorization.middleware";
import { Permission } from "../constants/authorization.constants";

const cattleWorkSessionRoutes = Router();

cattleWorkSessionRoutes.get('/', authorize(Permission.CATTLE_WORK_SESSION_READ), container.cattleWorkSessionController.getCattleWorkSessions);
cattleWorkSessionRoutes.get('/:id_cattle_work', authorize(Permission.CATTLE_WORK_SESSION_READ), container.cattleWorkSessionController.getCattleWorkSession);
cattleWorkSessionRoutes.post('/', authorize(Permission.CATTLE_WORK_SESSION_WRITE), container.cattleWorkSessionController.createCattleWorkSession);
cattleWorkSessionRoutes.put('/:id_cattle_work', authorize(Permission.CATTLE_WORK_SESSION_WRITE), container.cattleWorkSessionController.updateCattleWorkSession);
cattleWorkSessionRoutes.delete('/:id_cattle_work', authorize(Permission.CATTLE_WORK_SESSION_WRITE), container.cattleWorkSessionController.deleteCattleWorkSession);

export default cattleWorkSessionRoutes;