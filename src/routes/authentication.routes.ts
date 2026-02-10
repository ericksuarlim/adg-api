import { Router } from 'express';
import AuthenticationController from '../controllers/authentication.controller';

const router = Router();

router.post('/new-password', AuthenticationController.requestNewPassword);
router.post('/reset-password', AuthenticationController.resetPassword);
router.post('/login', AuthenticationController.login);
router.post('/logout', AuthenticationController.logout);

export default router;
