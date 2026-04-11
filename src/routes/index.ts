import { Router } from 'express';
import userRoutes from "./user.routes";
import companyRoutes from "./company.routes";
import cattleRoutes from "./cattle.routes";
import cattleWorkSessionRoutes from "./cattle-work-session.routes";
import authenticationRoutes from "./authentication.routes";

const router = Router();

router.use('/cattle-work-session', cattleWorkSessionRoutes);
router.use('/session', authenticationRoutes);
router.use('/cattle', cattleRoutes);
router.use('/user', userRoutes);
router.use('/company', companyRoutes);

export default router;