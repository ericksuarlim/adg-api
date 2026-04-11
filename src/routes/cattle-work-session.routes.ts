import { Router } from 'express';
import {container} from "../containers/container";

const cattleWorkSessionRoutes = Router();

cattleWorkSessionRoutes.get('/', container.cattleWorkSessionController.getCattleWorkSessions);
cattleWorkSessionRoutes.get('/:id_cattle_work', container.cattleWorkSessionController.getCattleWorkSession);
cattleWorkSessionRoutes.post('/', container.cattleWorkSessionController.createCattleWorkSession);
cattleWorkSessionRoutes.put('/:id_cattle_work', container.cattleWorkSessionController.updateCattleWorkSession);
cattleWorkSessionRoutes.delete('/:id_cattle_work', container.cattleWorkSessionController.deleteCattleWorkSession);

export default cattleWorkSessionRoutes;