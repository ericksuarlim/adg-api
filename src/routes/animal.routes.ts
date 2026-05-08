import { Router } from 'express';
import { container } from "../containers/container";
import { authorize } from "../middlewares/authorization.middleware";
import { Permission } from "../constants/authorization.constants";

const animalRoutes = Router();

animalRoutes.post('/', authorize(Permission.ANIMAL_WRITE), container.animalController.createAnimal);
animalRoutes.get('/:uuid_animal', authorize(Permission.ANIMAL_READ), container.animalController.getAnimal);
animalRoutes.get('/', authorize(Permission.ANIMAL_READ), container.animalController.getAnimals);
animalRoutes.put('/:uuid_animal', authorize(Permission.ANIMAL_WRITE), container.animalController.updateAnimal);
animalRoutes.delete('/:uuid_animal', authorize(Permission.ANIMAL_WRITE), container.animalController.deleteAnimal);

export default animalRoutes;
