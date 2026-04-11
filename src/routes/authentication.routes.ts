import { Router } from 'express';
import {container} from "../containers/container";

const authenticationRoutes = Router();

authenticationRoutes.post('/new-password', container.authenticationController.requestNewPassword);
authenticationRoutes.post('/reset-password', container.authenticationController.resetPassword);
authenticationRoutes.post('/login', container.authenticationController.login);
authenticationRoutes.post('/logout', container.authenticationController.logout);

export default authenticationRoutes;
