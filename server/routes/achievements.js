import { Router } from 'express';
import { getAchievements, createAchievement, deleteAchievement } from '../controllers/achievementController.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
router.get('/', getAchievements);
router.post('/', requireAuth, createAchievement);
router.delete('/:id', requireAuth, deleteAchievement);
export default router;
