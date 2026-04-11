import { Router } from 'express';
import {container} from "../containers/container";

const cattleRoutes = Router();

cattleRoutes.post('/', container.cattleController.createCattle);
cattleRoutes.get('/:uuid_cattle', container.cattleController.getCattle);
cattleRoutes.get('/', container.cattleController.getCattles);
cattleRoutes.put('/:uuid_cattle', container.cattleController.updateCattle);
cattleRoutes.delete('/:uuid_cattle', container.cattleController.deleteCattle);

export default cattleRoutes;
