import { Router } from 'express';
import {container} from "../containers/container";
import { authenticate } from "../middlewares/auth.middleware";

const authenticationRoutes = Router();

authenticationRoutes.post('/new-password', container.authenticationController.requestNewPassword);
authenticationRoutes.post('/reset-password', container.authenticationController.resetPassword);
authenticationRoutes.post('/login', container.authenticationController.login);
authenticationRoutes.post('/logout', authenticate, container.authenticationController.logout);
authenticationRoutes.get('/me', authenticate, container.authenticationController.me);

export default authenticationRoutes;
