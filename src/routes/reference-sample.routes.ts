import { Router } from 'express';
import { container } from "../containers/container";
import { authorize } from "../middlewares/authorization.middleware";
import { Permission } from "../constants/authorization.constants";

const referenceSampleRoutes = Router();

referenceSampleRoutes.post(
    '/',
    authorize(Permission.REFERENCE_SAMPLE_WRITE),
    container.referenceSampleController.create
);
referenceSampleRoutes.get(
    '/:uuid_reference_sample',
    authorize(Permission.REFERENCE_SAMPLE_READ),
    container.referenceSampleController.getById
);
referenceSampleRoutes.get(
    '/',
    authorize(Permission.REFERENCE_SAMPLE_READ),
    container.referenceSampleController.getAll
);
referenceSampleRoutes.put(
    '/:uuid_reference_sample',
    authorize(Permission.REFERENCE_SAMPLE_WRITE),
    container.referenceSampleController.update
);
referenceSampleRoutes.delete(
    '/:uuid_reference_sample',
    authorize(Permission.REFERENCE_SAMPLE_WRITE),
    container.referenceSampleController.delete
);

export default referenceSampleRoutes;
