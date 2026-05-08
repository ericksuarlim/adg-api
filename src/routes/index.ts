import { Router } from 'express';
import userRoutes from "./user.routes";
import companyRoutes from "./company.routes";
import animalRoutes from "./animal.routes";
import animalWorkSessionRoutes from "./animal-work-session.routes";
import authenticationRoutes from "./authentication.routes";
import ranchRoutes from "./ranch.routes";
import membershipRoutes from "./membership.routes";
import { authenticate } from "../middlewares/auth.middleware";
import publicRoutes from "./public.routes";
import referenceSampleRoutes from "./reference-sample.routes";

const router = Router();

router.use('/animal-work-session', animalWorkSessionRoutes);
router.use('/session', authenticationRoutes);
router.use('/public', publicRoutes);
router.use(authenticate);
router.use('/reference-sample', referenceSampleRoutes);
router.use('/animal', animalRoutes);
router.use('/user', userRoutes);
router.use('/company', companyRoutes);
router.use('/ranch', ranchRoutes);
router.use('/membership', membershipRoutes);

export default router;