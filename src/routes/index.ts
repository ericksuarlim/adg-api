import { Router } from 'express';
import userRoutes from "./user.routes";
import companyRoutes from "./company.routes";
import animalRoutes from "./animal.routes";
import animalWorkSessionRoutes from "./animal-work-session.routes";
import corralWorkSessionRoutes from "./corral-work-session.routes";
import authenticationRoutes from "./authentication.routes";
import ranchRoutes from "./ranch.routes";
import membershipRoutes from "./membership.routes";
import { authenticate } from "../middlewares/auth.middleware";
import { resolveTenantOperationalContext } from "../middlewares/tenant-context.middleware";
import ownerRoutes from "./owner.routes";
import paddockRoutes from "./paddock.routes";
import referenceSampleRoutes from "./reference-sample.routes";

const router = Router();

router.use('/session', authenticationRoutes);
router.use(authenticate);

/** SaaS-only routes: must not run `resolveTenantOperationalContext` (no tenant DB for list endpoints). */
router.use('/reference-sample', referenceSampleRoutes);
router.use('/user', userRoutes);
router.use('/company', companyRoutes);

const operationalRouter = Router({ mergeParams: true });
operationalRouter.use(resolveTenantOperationalContext);
operationalRouter.use('/ranch', ranchRoutes);
operationalRouter.use('/animal', animalRoutes);
operationalRouter.use('/owner', ownerRoutes);
operationalRouter.use('/paddock', paddockRoutes);
operationalRouter.use('/animal-work-session', animalWorkSessionRoutes);
operationalRouter.use('/corral-work-session', corralWorkSessionRoutes);
operationalRouter.use('/membership', membershipRoutes);

router.use(operationalRouter);

export default router;
