import { Router } from "express";
import { container } from "../containers/container";
import { authorize, authorizeAny } from "../middlewares/authorization.middleware";
import { Permission } from "../constants/authorization.constants";

const ownerRoutes = Router();

ownerRoutes.get(
    "/",
    authorizeAny(Permission.OWNER_READ, Permission.ANIMAL_READ),
    container.ownerController.listOwners
);
ownerRoutes.post("/", authorize(Permission.OWNER_WRITE), container.ownerController.create);
ownerRoutes.get(
    "/:owner_uuid",
    authorizeAny(Permission.OWNER_READ, Permission.ANIMAL_READ),
    container.ownerController.getById
);
ownerRoutes.put("/:owner_uuid", authorize(Permission.OWNER_WRITE), container.ownerController.update);
ownerRoutes.delete("/:owner_uuid", authorize(Permission.OWNER_WRITE), container.ownerController.delete);

export default ownerRoutes;
