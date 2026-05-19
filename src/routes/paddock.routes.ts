import { Router } from "express";
import { container } from "../containers/container";
import { authorize } from "../middlewares/authorization.middleware";
import { Permission } from "../constants/authorization.constants";

const paddockRoutes = Router();

paddockRoutes.get("/", authorize(Permission.PADDOCK_READ), container.paddockController.listByRanch);
paddockRoutes.post("/", authorize(Permission.PADDOCK_WRITE), container.paddockController.create);
paddockRoutes.get("/:paddock_uuid", authorize(Permission.PADDOCK_READ), container.paddockController.getById);
paddockRoutes.put("/:paddock_uuid", authorize(Permission.PADDOCK_WRITE), container.paddockController.update);
paddockRoutes.delete("/:paddock_uuid", authorize(Permission.PADDOCK_WRITE), container.paddockController.delete);

export default paddockRoutes;
