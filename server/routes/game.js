import { Router } from 'express';
import { getGameStats, recordScore } from '../controllers/gameController.js';
const router = Router();
router.get('/stats', getGameStats);
router.post('/score', recordScore);
export default router;
