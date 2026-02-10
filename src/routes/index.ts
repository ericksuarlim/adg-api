import { Router } from 'express';
import authenticationRouter from './authentication.routes';
import cattleWorkSessionRouter from './authentication.routes';
import cattleRoutes from './authentication.routes';
import userRoutes from "./user.routes";
/**/
const router = Router();

router.use('/cattle-work-session', cattleWorkSessionRouter);
router.use('/session', authenticationRouter);
router.use('/cattle', cattleRoutes);
router.use('/user', userRoutes);

export default router;