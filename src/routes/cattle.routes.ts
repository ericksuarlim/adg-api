import { Router } from 'express';
import CattleController from '../controllers/cattle.controller';


const router = Router();

router.post('/', CattleController.createCattle);
router.get('/:uuid_cattle', CattleController.getCattle);
router.get('/', CattleController.getCattles);
router.put('/:uuid_cattle', CattleController.updateCattle);
router.delete('/:uuid_cattle', CattleController.deleteCattle);

export default router;
