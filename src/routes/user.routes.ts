import { Router } from 'express';
import {container} from "../containers/container";
import { authorize } from "../middlewares/authorization.middleware";
import { Permission } from "../constants/authorization.constants";

const userRoutes = Router();

userRoutes.get('/availability', authorize(Permission.USER_READ), container.userController.checkUserFieldAvailability);
userRoutes.post('/', authorize(Permission.USER_WRITE), container.userController.createUser);
userRoutes.get('/:uuid_user', authorize(Permission.USER_READ), container.userController.getUser);
userRoutes.get('/', authorize(Permission.USER_READ), container.userController.getUsers);
userRoutes.put('/:uuid_user', authorize(Permission.USER_WRITE), container.userController.updateUser);
userRoutes.put('/manage/:uuid_user', authorize(Permission.USER_WRITE), container.userController.manageUser);
userRoutes.delete('/:uuid_user', authorize(Permission.USER_WRITE), container.userController.deleteUser);

export default userRoutes;
