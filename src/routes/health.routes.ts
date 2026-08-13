import { Router } from 'express';
import { container } from "../containers/container";

const healthRoutes = Router();

healthRoutes.get('/', container.healthController.check);

export default healthRoutes;
