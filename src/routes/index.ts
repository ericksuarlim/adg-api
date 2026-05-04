import { Router } from 'express';
import userRoutes from "./user.routes";
import companyRoutes from "./company.routes";
import cattleRoutes from "./cattle.routes";
import cattleWorkSessionRoutes from "./cattle-work-session.routes";
import authenticationRoutes from "./authentication.routes";
import ranchRoutes from "./ranch.routes";
import membershipRoutes from "./membership.routes";
import { authenticate } from "../middlewares/auth.middleware";
import publicRoutes from "./public.routes";
import referenceSampleRoutes from "./reference-sample.routes";

const router = Router();

router.use('/cattle-work-session', cattleWorkSessionRoutes);
router.use('/session', authenticationRoutes);
router.use('/public', publicRoutes);
router.use(authenticate);
router.use('/reference-sample', referenceSampleRoutes);
router.use('/cattle', cattleRoutes);
router.use('/user', userRoutes);
router.use('/company', companyRoutes);
router.use('/ranch', ranchRoutes);
router.use('/membership', membershipRoutes);

export default router;