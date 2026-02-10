import { Router } from 'express';
import AttendanceController from '../controllers/cattle-work-session.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', AttendanceController.getAll);
router.get('/:id_attendance', AttendanceController.getById);
router.post('/', AttendanceController.create);
router.put('/:id_attendance', AttendanceController.update);
router.delete('/:id_attendance', AttendanceController.delete);

export default router;