import { Router } from 'express';
import GeneralController from '../controllers/cattle.controller';

const router = Router();

router.post('/', GeneralController.createGeneral);
router.get('/:uuid_general', GeneralController.getGeneral);
router.get('/', GeneralController.getGenerals);
router.put('/:uuid_general', GeneralController.updateGeneral);
router.delete('/:uuid_general', GeneralController.deleteGeneral);

export default router;
