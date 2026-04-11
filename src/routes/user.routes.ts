import { Router } from 'express';
import {container} from "../containers/container";

const userRoutes = Router();

userRoutes.post('/', container.userController.createUser);
userRoutes.get('/:uuid_user', container.userController.getUser);
userRoutes.get('/', container.userController.getUsers);
userRoutes.put('/:uuid_user', container.userController.updateUser);
userRoutes.put('/manage/:uuid_user', container.userController.manageUser);
userRoutes.delete('/:uuid_user', container.userController.deleteUser);

export default userRoutes;
