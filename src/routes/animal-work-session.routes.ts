import { Router, RequestHandler } from 'express';
import { container } from "../containers/container";
import { authorize } from "../middlewares/authorization.middleware";
import { Permission } from "../constants/authorization.constants";

const animalWorkSessionRoutes = Router({ mergeParams: true });

animalWorkSessionRoutes.get('/', authorize(Permission.ANIMAL_WORK_SESSION_READ), container.animalWorkSessionController.getAnimalWorkSessions);
animalWorkSessionRoutes.get('/:id_animal_work', authorize(Permission.ANIMAL_WORK_SESSION_READ), container.animalWorkSessionController.getAnimalWorkSession as unknown as RequestHandler);
animalWorkSessionRoutes.post('/', authorize(Permission.ANIMAL_WORK_SESSION_WRITE), container.animalWorkSessionController.createAnimalWorkSession);
animalWorkSessionRoutes.put('/:id_animal_work', authorize(Permission.ANIMAL_WORK_SESSION_WRITE), container.animalWorkSessionController.updateAnimalWorkSession as unknown as RequestHandler);
animalWorkSessionRoutes.delete('/:id_animal_work', authorize(Permission.ANIMAL_WORK_SESSION_WRITE), container.animalWorkSessionController.deleteAnimalWorkSession as unknown as RequestHandler);

export default animalWorkSessionRoutes;
