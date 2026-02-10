import { Router } from 'express';
import UserController from '../controllers/user.controller';

const userRoutes = Router();

userRoutes.post('/', UserController.createUser);
userRoutes.get('/:uuid_user', UserController.getUser);
userRoutes.get('/', UserController.getUsers);
userRoutes.put('/:uuid_user', UserController.updateUser);
userRoutes.put('/manage/:uuid_user', UserController.manageUser);
userRoutes.delete('/:uuid_user', UserController.deleteUser);

export default userRoutes;
