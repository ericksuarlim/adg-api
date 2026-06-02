import { Router } from "express";
import { container } from "../containers/container";
import { authorize } from "../middlewares/authorization.middleware";
import { Permission } from "../constants/authorization.constants";

const animalRoutes = Router();

animalRoutes.get("/breeds", authorize(Permission.ANIMAL_READ), container.animalController.listBreeds);
animalRoutes.get("/parents", authorize(Permission.ANIMAL_READ), container.animalController.listParentCandidates);
animalRoutes.get("/", authorize(Permission.ANIMAL_READ), container.animalController.getAnimals);
animalRoutes.post("/batch", authorize(Permission.ANIMAL_WRITE), container.animalController.createBatch);
animalRoutes.post("/", authorize(Permission.ANIMAL_WRITE), container.animalController.createAnimal);
animalRoutes.get("/:uuid_animal", authorize(Permission.ANIMAL_READ), container.animalController.getAnimal);
animalRoutes.put("/:uuid_animal", authorize(Permission.ANIMAL_WRITE), container.animalController.updateAnimal);
animalRoutes.delete("/:uuid_animal", authorize(Permission.ANIMAL_WRITE), container.animalController.deleteAnimal);

export default animalRoutes;
