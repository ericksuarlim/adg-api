import { Router } from 'express';
import CattleWorkSessionController from '../controllers/cattle-work-session.controller';


const router = Router();


router.get('/', CattleWorkSessionController.getCattleWorkSessions);
router.get('/:id_cattle_work', CattleWorkSessionController.getCattleWorkSession);
router.post('/', CattleWorkSessionController.createCattleWorkSession);
router.put('/:id_cattle_work', CattleWorkSessionController.updateCattleWorkSession);
router.delete('/:id_cattle_work', CattleWorkSessionController.deleteCattleWorkSession);

export default router;