import { Router } from "express";
import { container } from "../containers/container";
import { authorize } from "../middlewares/authorization.middleware";
import { Permission } from "../constants/authorization.constants";

const ownerRoutes = Router();

ownerRoutes.get("/", authorize(Permission.ANIMAL_READ), container.ownerController.listActiveOwners);

export default ownerRoutes;
